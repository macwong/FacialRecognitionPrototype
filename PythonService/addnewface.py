from Helpers import helpers
from daveglobals import Globals
import shutil

def add(image, model):
    # Create temp image
    helpers.save_temp_face(image)
    
    # Get facenet embeddings
    
    # Load model
    
    # Add new embedding to array
    
    # Retrain?
    
    # Save the new model / embeddings etc
    
    # Cleanup
    shutil.rmtree(Globals.temp_path)
    
    return True, ""