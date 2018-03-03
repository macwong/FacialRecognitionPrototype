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
from distutils.dir_util import copy_tree
import uuid
from daveglobals import Globals
import datetime

class FeatureEmbeddings():
    def __init__(self, success, error, dataset = None, emb_array = None, labels = None, paths = None, classifier_filename_exp = None):
        self.success = success
        self.error = error
        self.dataset = dataset
        self.emb_array = emb_array
        self.labels = labels
        self.paths = paths
        self.classifier_filename_exp = classifier_filename_exp

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
        return FeatureEmbeddings(False, "Nobody's home")

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
    
    return FeatureEmbeddings(True, "", dataset, emb_array, labels, paths, classifier_filename_exp)


def train(data_dir, session, classifier_filename):
    
    features = get_features(data_dir, session, classifier_filename)
    
    # Train classifier
    print('Training classifier')
    model = SVC(kernel='linear', probability=True)
    model.fit(features.emb_array, features.labels)

    # Create a list of class names
    class_names = [ cls.name.replace('_', ' ') for cls in features.dataset]

    # Saving classifier model
    with open(features.classifier_filename_exp, 'wb') as outfile:
        pickle.dump((model, class_names), outfile)
    print('Saved classifier model to file "%s"' % features.classifier_filename_exp)

def prediction(data_dir, session, classifier_filename, model_path, verbose):
    features = get_features(data_dir, session, classifier_filename)

    if features.success == False:
        return PredictResponse(features.error)
    
    print('Testing classifier')
    with open(features.classifier_filename_exp, 'rb') as infile:
        (model, class_names) = pickle.load(infile)
        
    print('Loaded classifier model from file "%s"' % features.classifier_filename_exp)

    predictions = model.predict_proba(features.emb_array)
    pred_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    best_class_indices = np.argmax(predictions, axis=1)
#        best_class_probabilities = predictions[np.arange(len(best_class_indices)), best_class_indices]
    
    pred_names = []
    
    temp_predicted_path = os.path.join(data_dir, "predicted")
    
    if not os.path.exists(temp_predicted_path):
        os.makedirs(temp_predicted_path)
        
    for i in range(len(best_class_indices)):
        pred_name = class_names[best_class_indices[i]]
        all_pred = predictions[i]
        best_dist = 0
        best_prob = 0
        top_indices = sorted(range(len(all_pred)), key=lambda i: all_pred[i], reverse=True)[:5]
        
        if verbose:
            pred_info_list = []
            print("Awesome indices:", len(top_indices))
            for top_index in top_indices:
                pred_info = PredictionInfo()
                pred_info.name = class_names[top_index]
                pred_info.probability = all_pred[top_index]
                folder_name = pred_info.name.replace(' ', '_')
                
                photo_path_folder = os.path.join(model_path, "data", folder_name)
                pred_info.photo_path = [os.path.join(photo_path_folder, f) for f in os.listdir(photo_path_folder) if os.path.isfile(os.path.join(photo_path_folder, f))]
                
                # Create temp photo path for predicted values
                unique_path = os.path.join(temp_predicted_path, str(uuid.uuid4()))
                
                if not os.path.exists(unique_path):
                    os.makedirs(unique_path)
                
                copyto_path = os.path.join(unique_path, folder_name)

                copy_tree(photo_path_folder, copyto_path, update = 1)
                
                # Get the feature embeddings for the prediction's training data, and get the average value
                predicted_features = get_features(unique_path, session, "")
                
                # Calculate the distance between the predicted and actual embeddings
                # The following URL has a basic example of the formula
                # https://www.mathway.com/popular-problems/Basic%20Math/35308
                # Our implementation just happens to have a few more coordinates (128 rather than 2)
                dist = 0
                
                for emb in predicted_features.emb_array:
                    single_dist = np.sqrt(np.sum(np.square(np.subtract(features.emb_array[i], emb))))
                    print(single_dist)
                    
                    dist = dist + single_dist
                
                dist = dist / len(predicted_features.emb_array)
                print(len(predicted_features.emb_array))
                print(dist)
                
                # Set the distance in the PredictionInfo object
                pred_info.distance = dist
                
                if pred_info.name == pred_name:
                    best_dist = dist
                    best_prob = pred_info.probability
                
                pred_info_list.append(pred_info.serialize())
        
        with open(features.paths[i], "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read())
            encoded_string = encoded_string.decode('utf-8')
        
        print(pred_name)
        
        prediction_id = Globals.current_prediction_id
        Globals.current_prediction_id += 1
        
        pred_names.append({
            "prediction_id": prediction_id,
            "pred_name": pred_name,
            "pred_time": pred_time,
            "distance": best_dist,
            "probability": best_prob,
            "image": encoded_string,
            "info": pred_info_list
        })
    
    pred_names = sorted(pred_names, key = lambda x: x["distance"])
        
    predict_response = PredictResponse("", True, pred_names)
    
    return predict_response

            
