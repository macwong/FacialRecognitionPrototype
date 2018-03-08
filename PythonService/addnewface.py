from Helpers import helpers
from daveglobals import Globals
from mygraph import MyGraph
import shutil
import classifier
import os

def add(image, model_folder):
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
    
    # Add new embedding to array
    
    # Retrain?
    
    # Save the new model / embeddings etc
    
    # Cleanup
    shutil.rmtree(Globals.temp_path)
    
    return True, ""