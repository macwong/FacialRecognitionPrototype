from Helpers import helpers
from daveglobals import Globals
from mygraph import MyGraph
import shutil
import classifier
import os

def add(image, model_folder):
    # Create temp image
    helpers.save_temp_face(image)
    
    # Get facenet embeddings
    model_path = os.path.join(Globals.model_path, model_folder)
    classifier_file = os.path.join(model_path, "classifier.pkl")
    
    features = classifier.get_features(Globals.temp_path, MyGraph(), classifier_file)
    print(features.emb_array)
    
    # Load model
    
    # Add new embedding to array
    
    # Retrain?
    
    # Save the new model / embeddings etc
    
    # Cleanup
    shutil.rmtree(Globals.temp_path)
    
    return True, ""