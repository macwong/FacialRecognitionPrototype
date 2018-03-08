from Helpers import helpers
from daveglobals import Globals
from mygraph import MyGraph
import shutil
import classifier
import os
import numpy as np

def add(image, model_folder, name):
    # Create temp image
    file_path, error = helpers.save_temp_face(image)
    
    if error != "":
        return False, error
    
    # Get facenet embeddings
    model_path = os.path.join(Globals.model_path, model_folder)
    classifier_file = os.path.join(model_path, "classifier.pkl")
    
    features = classifier.get_features(Globals.temp_path, MyGraph(), classifier_file)
    
    if features.success == False:
        return False, features.error
    
    # Load model
    (model, class_names, emb_array, labels) = helpers.load_model(features.classifier_filename_exp)
    
#    print(emb_array.shape)
#    print(features.emb_array.shape)
    emb_array = np.append(emb_array, features.emb_array, axis = 0)
    
    # Add new embedding to array
#    print("Emb array")
#    print(emb_array.shape)

    matches = (n for n in class_names if n.lower() == name.lower())
    
    if not matches:
        print("Name not found... adding new name")
        class_names.append(name)
        
    name_index = class_names.index(name)
    labels.append(name_index)

    
#    print(len(labels))
#    print(len(class_names))
    
    # Retrain?
    
    # Save the new model / embeddings etc
    
    # Cleanup
    shutil.rmtree(Globals.temp_path)
    
    return True, ""