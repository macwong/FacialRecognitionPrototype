import os
import base64
from mimetypes import guess_extension
import uuid

def predict(image):
    train_data_path = "D:\_GithubTest\FacialRecognitionPrototype\data"
    temp_path = os.path.join(train_data_path, "temp")
    
    if not os.path.exists(train_data_path):
        return False, "Training Data Path not found"
    
    if not os.path.exists(temp_path):
        os.makedirs(temp_path)
    
    print("Convert base64 image to temp file")

    # wb... 'w' = open for writing, 'b' = binary mode
    image_split = image.split(',', 1)
    
    prefix = image_split[0]
    prefix = prefix[len("data:"):len(prefix) - len("base64,")]
    extension = guess_extension(prefix)

    if extension == None:
        return False, "Not a valid file mime type"
    
    image = image_split[1]

    file_name = str(uuid.uuid4()) + extension
    file_path = os.path.join(temp_path, file_name)
    imgdata = base64.b64decode(image)
    
    with open(file_path, "wb") as fh:
        fh.write(imgdata)
        
    
    
    
    return True, ""