import os
import shutil
import classifier
import Helpers.align_dataset as align
from align_options import AlignOptions
from mygraph import MyGraph
from daveglobals import Globals
from Helpers import helpers

class PredictionInfo():
    def __init__(self):
        self.name = ""
        self.photo_path = ""
        self.probability = 0
        self.distance = 0
        pass
    
    def serialize(self):
        return {
            "name": self.name,
            "photo_path": self.photo_path,
            "probability": self.probability,
            "distance": self.distance
        }

class PredictResponse():
    def __init__(self, error = "", success = False, predictions = None, top_predictions = None):
        self.success = success
        self.predictions = predictions
        self.error = error
        
def predict(image, model_folder, verbose):
    error = helpers.save_temp_face(image)
       
    if error != "":
        return PredictResponse(error)
    
    print("Align image to work with classifier")
    temp_predict = os.path.join(Globals.data_path, "temp_predict")
    align.align_faces(AlignOptions(Globals.temp_path, temp_predict, True))
    shutil.rmtree(Globals.temp_path)
    
    print("Classify image")
    temp_predict_data = os.path.join(temp_predict, "data")
    
    if not os.path.exists(temp_predict_data):
        return PredictResponse("Could not detect face")
    
    model_path = os.path.join(Globals.model_path, model_folder)
    classifier_file = os.path.join(model_path, "classifier.pkl")
    
    predict_response = classifier.prediction(temp_predict, MyGraph(), classifier_file, model_path, verbose)
    print("Cleanup...")
    shutil.rmtree(temp_predict)
    
    return predict_response