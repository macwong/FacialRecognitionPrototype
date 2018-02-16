import os
from shutil import copyfile
import Helpers.align_dataset as align

class AlignOptions():
    def __init__(self, input_dir, output_dir):
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.image_size = 160
        self.margin = 32
        self.random_order = True
        self.gpu_memory_fraction = 0.25
        self.detect_multiple_faces = False
        

def train(input_folder_path, model_folder_name):
    print("Input Folder Path:", input_folder_path)
    print("Model Folder Name:", model_folder_name)
    
    print("Checking Directories...")
    if os.path.exists(input_folder_path) == False:
        return False, "Invalid input folder!"
    
    train_data_path = "D:\_GithubTest\FacialRecognitionPrototype\data"
    processed_dir = os.path.join(train_data_path, "processed")
    
    align.align_faces(AlignOptions(input_folder_path, processed_dir))
    
    return True, ""