import os
from shutil import copyfile
import Helpers.align_dataset as align
import classifier
from align_options import AlignOptions
        
def train(input_folder_path, model_folder_name):
    print("Input Folder Path:", input_folder_path)
    print("Model Folder Name:", model_folder_name)
    
    
    print("Checking Directories...")
    if os.path.exists(input_folder_path) == False:
        return False, None, "Invalid input folder!"
    
    
    print("Aligning faces...")
    train_data_path = "D:\_GithubTest\FacialRecognitionPrototype\data"
    model_dir = os.path.join(train_data_path, model_folder_name)
    processed_dir = os.path.join(model_dir, "data")
    
    align.align_faces(AlignOptions(input_folder_path, processed_dir))
    
    directories = os.listdir(processed_dir)
    
    for d in directories:
        subdir = os.path.join(processed_dir, d)
        
        if os.path.isdir(subdir):
            files = os.listdir(subdir)
            
            if len(files) == 1:
                file_name_split = os.path.splitext(files[0])
                file_path_from = os.path.join(subdir, files[0])
                file_path_to = os.path.join(subdir, file_name_split[0] + "_2" + file_name_split[1])
                print("Only 1 image found for training... Duplicating ", file_path_from)
                copyfile(file_path_from, file_path_to)
    
    print("Training...")
    
    success, predictions, error = classifier.classifier(mode = "TRAIN", 
           model = "D:\\_GithubTest\\FacialRecognitionPrototype\\data\\facenet_models\\20170512-110547.pb",
           data_dir = processed_dir, 
           classifier_filename = os.path.join(model_dir, "classifier.pkl"))
    
    return success, predictions, error