from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import tensorflow as tf
import numpy as np
import argparse
import Helpers.facenet.facenet as facenet
import Helpers.facenet.lfw
import os
import sys
import math
import pandas as pd
from sklearn import metrics
from scipy.optimize import brentq
from scipy import interpolate
import pickle
from sklearn.svm import SVC
from matplotlib.pyplot import imshow
import matplotlib.pyplot as plt
from PIL import Image
from tensorflow.python.platform import gfile

class WrongAnswer():
    def __init__(self, predicted, actual, test_filepath, train_dirpath, actual_dirpath):
        self.predicted = predicted
        self.predicted_name = os.path.basename(train_dirpath)
        self.actual = actual
        self.actual_name = os.path.basename(actual_dirpath)
        self.test_filepath = test_filepath
        self.train_dirpath = train_dirpath
        self.actual_dirpath = actual_dirpath

def predict():
    pass

def classifier(mode, # = 'CLASSIFY', 
               data_dir, # = '../data/subset/train', 
               session,
               classifier_filename, # = '../data/subset/subset_classifier.pkl', 
               use_split_dataset = False, 
               train_data_dir = None, 
               batch_size=90, 
               image_size=160, 
               seed=666, 
               min_nrof_images_per_class=20, 
               nrof_train_images_per_class=10):
  
    np.random.seed(seed=seed)
    
    if use_split_dataset:
        dataset_tmp = facenet.get_dataset(data_dir)
        train_set, test_set = split_dataset(dataset_tmp, min_nrof_images_per_class, nrof_train_images_per_class)
        if (mode=='TRAIN'):
            dataset = train_set
        elif (mode=='CLASSIFY'):
            dataset = test_set
    else:
        dataset = facenet.get_dataset(data_dir)

    # Check that there are at least one training image per class
    for cls in dataset:
        assert(len(cls.image_paths)>0, 'There must be at least one image for each class in the dataset')            

    paths, labels = facenet.get_image_paths_and_labels(dataset)
    
    results = pd.DataFrame([len(dataset)], columns=['Classes'])
    
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

    if (mode=='TRAIN'):
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
        
    elif (mode == 'CLASSIFY'):
        print('Testing classifier')
        with open(classifier_filename_exp, 'rb') as infile:
            (model, class_names) = pickle.load(infile)
            
        print('Loaded classifier model from file "%s"' % classifier_filename_exp)

        predictions = model.predict_proba(emb_array)

        best_class_indices = np.argmax(predictions, axis=1)
        best_class_probabilities = predictions[np.arange(len(best_class_indices)), best_class_indices]
        
        classify_list = next(os.walk(train_data_dir))[1]
        
        pred_names = []
        for i in range(len(best_class_indices)):
            pred_name = classify_list[best_class_indices[i]]
            pred_names.append(pred_name)
            print(pred_name)
            
        return True, pred_names, ""
            
    elif (mode=='CLASSIFYALL'):
        # Classify images
        print('Testing classifier')
        with open(classifier_filename_exp, 'rb') as infile:
            (model, class_names) = pickle.load(infile)

        print('Loaded classifier model from file "%s"' % classifier_filename_exp)

        predictions = model.predict_proba(emb_array)
        best_class_indices = np.argmax(predictions, axis=1)
        best_class_probabilities = predictions[np.arange(len(best_class_indices)), best_class_indices]
        
        for i in range(len(best_class_indices)):
            msg = "WRONG!!!"
            
            if np.equal(best_class_indices[i], labels[i]):
                msg = "Correct"
            else:
                wrong = WrongAnswer(best_class_indices[i], 
                                    labels[i], 
                                    paths[i], 
                                    os.path.dirname(paths[best_class_indices[i]]),
                                    os.path.dirname(paths[i])
                                   )
                
                print("\nPredicted:", wrong.predicted, "(" + wrong.predicted_name + "), Actual:", wrong.actual, "(" + wrong.actual_name + ")")
                print(wrong.test_filepath)
                print(wrong.train_dirpath)
                print(wrong.actual_dirpath)
                
                
#                     print("\nReading " + os.path.basename(paths[i]) + "... " + msg)

#                     print('%4d  %s: %.3f' % (i, class_names[best_class_indices[i]], best_class_probabilities[i]))

            
        accuracy = np.mean(np.equal(best_class_indices, labels))
        print('\nAccuracy: %.3f' % accuracy)
        
    return True, None, ""

            
def split_dataset(dataset, min_nrof_images_per_class, nrof_train_images_per_class):
    train_set = []
    test_set = []
    for cls in dataset:
        paths = cls.image_paths
        # Remove classes with less than min_nrof_images_per_class
        if len(paths)>=min_nrof_images_per_class:
            np.random.shuffle(paths)
            train_set.append(facenet.ImageClass(cls.name, paths[:nrof_train_images_per_class]))
            test_set.append(facenet.ImageClass(cls.name, paths[nrof_train_images_per_class:]))
    return train_set, test_set