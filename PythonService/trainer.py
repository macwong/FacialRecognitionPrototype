import os
from shutil import copyfile

def train(input_folder_path, model_folder_name):
    print("Input Folder Path:", input_folder_path)
    print("Model Folder Name:", model_folder_name)
    
    print("Checking Directories...")
    if os.path.exists(input_folder_path) == False:
        return False, "Invalid input folder!"
    
#    os.listdir(input_folder_path)
    

    
    return True, ""