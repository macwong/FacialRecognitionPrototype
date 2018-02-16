import os
from shutil import copyfile
import Helpers.align_dataset as align
import classifier

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
    
    
    print("Aligning faces...")
    train_data_path = "D:\_GithubTest\FacialRecognitionPrototype\data"
    model_dir = os.path.join(train_data_path, model_folder_name)
    processed_dir = os.path.join(model_dir, "data")
    
    align.align_faces(AlignOptions(input_folder_path, processed_dir))

    # TODO: duplicate picture if only 1 exists
    
    print("Training...")
    
    classifier.classifier(mode = "TRAIN", 
           model = "D:\\_GithubTest\\FacialRecognitionPrototype\\data\\facenet_models\\20170512-110547.pb",
           data_dir = processed_dir, 
           classifier_filename = os.path.join(model_dir, "classifier.pkl"))
    
    return True, ""