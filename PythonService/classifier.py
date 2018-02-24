from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import base64
import numpy as np
import Helpers.facenet.facenet as facenet
import os
import math
import pickle
from sklearn.svm import SVC
from predictor import PredictResponse

class WrongAnswer():
    def __init__(self, predicted, actual, test_filepath, train_dirpath, actual_dirpath):
        self.predicted = predicted
        self.predicted_name = os.path.basename(train_dirpath)
        self.actual = actual
        self.actual_name = os.path.basename(actual_dirpath)
        self.test_filepath = test_filepath
        self.train_dirpath = train_dirpath
        self.actual_dirpath = actual_dirpath

def get_features(data_dir, session, classifier_filename, batch_size=90, image_size=160, seed=666):
    np.random.seed(seed=seed)
    
    dataset = facenet.get_dataset(data_dir)

    # Check that there are at least one training image per class
    for cls in dataset:
        assert(len(cls.image_paths)>0, 'There must be at least one image for each class in the dataset')            

    paths, labels = facenet.get_image_paths_and_labels(dataset)
    
    print('Number of classes: %d' % len(dataset))
    print('Number of images: %d' % len(paths))
    
    embedding_size = session.embeddings.get_shape()[1]
    
    # Run forward pass to calculate embeddings
    print('Calculating features for images')
    nrof_images = len(paths)
    
    if nrof_images == 0:
        return False, None, "Nobody's home"

    nrof_batches_per_epoch = int(math.ceil(1.0*nrof_images / batch_size))
    emb_array = np.zeros((nrof_images, embedding_size))
    for i in range(nrof_batches_per_epoch):
        start_index = i*batch_size
        end_index = min((i+1)*batch_size, nrof_images)
        paths_batch = paths[start_index:end_index]
        images = facenet.load_data(paths_batch, False, False, image_size)
        feed_dict = { session.images_placeholder:images, session.phase_train_placeholder:False }
        emb_array[start_index:end_index,:] = session.sess.run(session.embeddings, feed_dict=feed_dict)
    
    classifier_filename_exp = os.path.expanduser(classifier_filename)
    
    return emb_array, labels, dataset, classifier_filename_exp, paths


def train(data_dir, session, classifier_filename):
    
    emb_array, labels, dataset, classifier_filename_exp, paths = get_features(
        data_dir,
        session,
        classifier_filename)
    
    # Train classifier
    print('Training classifier')
    model = SVC(kernel='linear', probability=True)
    model.fit(emb_array, labels)

    # Create a list of class names
    class_names = [ cls.name.replace('_', ' ') for cls in dataset]

    # Saving classifier model
    with open(classifier_filename_exp, 'wb') as outfile:
        pickle.dump((model, class_names), outfile)
    print('Saved classifier model to file "%s"' % classifier_filename_exp)

def prediction(data_dir, session, classifier_filename, verbose):
    emb_array, labels, dataset, classifier_filename_exp, paths = get_features(
        data_dir,
        session,
        classifier_filename)
    
    print('Testing classifier')
    with open(classifier_filename_exp, 'rb') as infile:
        (model, class_names) = pickle.load(infile)
        
    print('Loaded classifier model from file "%s"' % classifier_filename_exp)

    predictions = model.predict_proba(emb_array)

    best_class_indices = np.argmax(predictions, axis=1)
#        best_class_probabilities = predictions[np.arange(len(best_class_indices)), best_class_indices]
    
    pred_names = []
    for i in range(len(best_class_indices)):
        pred_name = class_names[best_class_indices[i]]
        
        with open(paths[i], "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read())
            encoded_string = encoded_string.decode('utf-8')
        
        print(pred_name)
        pred_names.append({
            "pred_name": pred_name,
            "image": encoded_string
        })
        
    return PredictResponse("", True, pred_names)


            
