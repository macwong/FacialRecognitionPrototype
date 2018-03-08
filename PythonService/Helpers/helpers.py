import os
from daveglobals import Globals
from shutil import copyfile
from mimetypes import guess_extension
import uuid
import base64

def save_temp_face(image):
    temp_data_path = os.path.join(Globals.temp_path, "data")
    
    if not os.path.exists(Globals.data_path):
        return "Training Data Path not found"
    
    if not os.path.exists(Globals.temp_path):
        os.makedirs(Globals.temp_path)

    if not os.path.exists(temp_data_path):
        os.makedirs(temp_data_path)
    
    try:
        if os.path.isfile(image):
            print("Copy file to temp path")
            f_name = os.path.basename(image)
            copyfile(image, os.path.join(temp_data_path, f_name))
    
    except ValueError:
        print("Convert base64 image to temp file")
    
        extension = None
        
        if image[0:len("data:")] == "data:":
            # wb... 'w' = open for writing, 'b' = binary mode
            image_split = image.split(',', 1)
            
            prefix = image_split[0]
            prefix = prefix[len("data:"):len(prefix) - len("base64,")]
            extension = guess_extension(prefix)
            image = image_split[1]
        else:
            # Must have been created by us, so we know it's a .png
            extension = ".png"
    
        if extension == None:
            return "Not a valid file mime type"
    
        file_guid = str(uuid.uuid4())
        file_name = file_guid + extension
        file_path = os.path.join(temp_data_path, file_name)
        imgdata = base64.b64decode(image)
        
        with open(file_path, "wb") as fh:
            fh.write(imgdata)
            
        if imgdata == None:
            return "No image data available"
            
    return ""
