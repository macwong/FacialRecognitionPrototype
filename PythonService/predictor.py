import os
import shutil
import base64
from mimetypes import guess_extension
import uuid
from classifier import classifier
import Helpers.align_dataset as align
from align_options import AlignOptions

def predict(image):
    train_data_path = "D:\_GithubTest\FacialRecognitionPrototype\data"
    temp_path = os.path.join(train_data_path, "temp")
    temp_data_path = os.path.join(temp_path, "data")
    
    if not os.path.exists(train_data_path):
        return False, "Training Data Path not found"
    
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
        return False, "Not a valid file mime type"
    
    image = image_split[1]

    file_guid = str(uuid.uuid4())
    file_name = file_guid + extension
    file_path = os.path.join(temp_data_path, file_name)
    imgdata = base64.b64decode(image)
    
    with open(file_path, "wb") as fh:
        fh.write(imgdata)
        
    print("Align image to work with classifier")
    temp_predict = os.path.join(train_data_path, "temp_predict")
    align.align_faces(AlignOptions(temp_path, temp_predict))
    shutil.rmtree(temp_path)
    
    print("Classify image")
    temp_predict_data = os.path.join(temp_predict, "data")
    pred_file_path = os.path.join(temp_predict_data, file_guid + ".png")
    
    if not os.path.exists(pred_file_path):
        return False, "Could not detect face"
    
    model_folder = "test_model"
    model_path = os.path.join(train_data_path, model_folder)
    classifier_file = os.path.join(model_path, "classifier.pkl")
    
    classifier(mode = 'CLASSIFY', 
           model = "D:\\_GithubTest\\FacialRecognitionPrototype\\data\\facenet_models\\20170512-110547.pb",
           data_dir = temp_predict,
           classifier_filename = classifier_file)
    
    print("Cleanup...")
#    shutil.rmtree(temp_predict)
    
    return True, ""