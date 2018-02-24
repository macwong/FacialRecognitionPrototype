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
from predictor import PredictResponse, PredictionInfo
from daveglobals import Globals

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

def prediction(data_dir, session, classifier_filename, model_path, verbose):
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
    pred_info_all = []
    
    for i in range(len(best_class_indices)):
        pred_name = class_names[best_class_indices[i]]
        all_pred = predictions[i]
        top_indices = sorted(range(len(all_pred)), key=lambda i: all_pred[i], reverse=True)[:3]
        
        if verbose:
            pred_info_list = []
            
            for top_index in top_indices:
                pred_info = PredictionInfo()
                pred_info.name = class_names[top_index]
                pred_info.probability = all_pred[top_index]
                pred_info.photo_path = os.path.join(model_path, pred_info.name.replace(' ', '_'))
#                pred_info.distance = 
                pred_info_list.append(pred_info.serialize())
                
            pred_info_all.append(pred_info_list)
        
        with open(paths[i], "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read())
            encoded_string = encoded_string.decode('utf-8')
        
        print(pred_name)
        pred_names.append({
            "pred_name": pred_name,
            "image": encoded_string
        })
        
    predict_response = PredictResponse("", True, pred_names, pred_info_all)
    
    return predict_response

            
