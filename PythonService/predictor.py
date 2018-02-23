import os
import shutil
import base64
from mimetypes import guess_extension
import uuid
from classifier import classifier
import Helpers.align_dataset as align
from align_options import AlignOptions
from mygraph import MyGraph
from daveglobals import Globals

def predict(image):
    temp_path = os.path.join(Globals.data_path, "temp")
    temp_data_path = os.path.join(temp_path, "data")
    
    if not os.path.exists(Globals.data_path):
        return False, None, "Training Data Path not found"
    
    if not os.path.exists(temp_path):
        os.makedirs(temp_path)

    if not os.path.exists(temp_data_path):
        os.makedirs(temp_data_path)
    
    print("Convert base64 image to temp file")

    # wb... 'w' = open for writing, 'b' = binary mode
    image_split = image.split(',', 1)
    
    prefix = image_split[0]
    prefix = prefix[len("data:"):len(prefix) - len("base64,")]
    extension = guess_extension(prefix)

    if extension == None:
        return False, None, "Not a valid file mime type"
    
    image = image_split[1]

    file_guid = str(uuid.uuid4())
    file_name = file_guid + extension
    file_path = os.path.join(temp_data_path, file_name)
    imgdata = base64.b64decode(image)
    
    with open(file_path, "wb") as fh:
        fh.write(imgdata)
        
    print("Align image to work with classifier")
    temp_predict = os.path.join(Globals.data_path, "temp_predict")
    align.align_faces(AlignOptions(temp_path, temp_predict, True))
    shutil.rmtree(temp_path)
    
    print("Classify image")
    temp_predict_data = os.path.join(temp_predict, "data")
    
    if not os.path.exists(temp_predict_data):
        return False, None, "Could not detect face"
    
#    model_folder = "test_model"
#    model_folder = "lfw500"
#    model_folder = "lfw614"
#    model_folder = "lfw615"
    model_folder = "timdata"
    
    model_path = os.path.join(Globals.model_path, model_folder)
    classifier_file = os.path.join(model_path, "classifier.pkl")
    
    success, predictions, error = classifier(mode = 'CLASSIFY', 
           data_dir = temp_predict,
           session = MyGraph(),
           classifier_filename = classifier_file)

    print("Cleanup...")
    shutil.rmtree(temp_predict)
    
    return success, predictions, error