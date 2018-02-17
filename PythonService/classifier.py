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
               classifier_filename, # = '../data/subset/subset_classifier.pkl', 
               model = '../data/models/20170512-110547.pb', 
               use_split_dataset = False, 
               train_data_dir = None, 
               batch_size=90, 
               image_size=160, 
               seed=666, 
               min_nrof_images_per_class=20, 
               nrof_train_images_per_class=10):
  
    with tf.Graph().as_default():
      
        with tf.Session() as sess:
            
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
            
            # Load the model
            print('Loading feature extraction model')
            facenet.load_model(model)
            
            # Get input and output tensors
            images_placeholder = tf.get_default_graph().get_tensor_by_name("input:0")
            embeddings = tf.get_default_graph().get_tensor_by_name("embeddings:0")
            phase_train_placeholder = tf.get_default_graph().get_tensor_by_name("phase_train:0")
            embedding_size = embeddings.get_shape()[1]
            
            # Run forward pass to calculate embeddings
            print('Calculating features for images')
            nrof_images = len(paths)
            nrof_batches_per_epoch = int(math.ceil(1.0*nrof_images / batch_size))
            emb_array = np.zeros((nrof_images, embedding_size))
            for i in range(nrof_batches_per_epoch):
                start_index = i*batch_size
                end_index = min((i+1)*batch_size, nrof_images)
                paths_batch = paths[start_index:end_index]
                images = facenet.load_data(paths_batch, False, False, image_size)
                feed_dict = { images_placeholder:images, phase_train_placeholder:False }
                emb_array[start_index:end_index,:] = sess.run(embeddings, feed_dict=feed_dict)
            
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
#                print(predictions)
#                print(best_class_indices)
#                print(best_class_probabilities)
                
                classify_list = os.listdir(train_data_dir)
                print(train_data_dir)
                print(len(classify_list))
                
#                for i in range(len(best_class_indices)):
#                    print(os.path.dirname(paths[best_class_indices[i]]))
#                    print(os.path.dirname(paths[i]))
#                    print(paths[i])
#                    print(best_class_indices[i])
                pass
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
            
    return results

            
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