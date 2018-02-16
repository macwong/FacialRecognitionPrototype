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
    input_dir = os.path.join(train_data_path, "test_input")
    output_dir = os.path.join(train_data_path, "processed")
    
#    os.listdir(input_folder_path)
        
    align.align_faces(AlignOptions(input_dir, output_dir))
        
    

        
    
#def parse_arguments(argv):
#    parser = argparse.ArgumentParser()
#    
#    parser.add_argument('input_dir', type=str, help='Directory with unaligned images.')
#    parser.add_argument('output_dir', type=str, help='Directory with aligned face thumbnails.')
#    parser.add_argument('--image_size', type=int,
#        help='Image size (height, width) in pixels.', default=182)
#    parser.add_argument('--margin', type=int,
#        help='Margin for the crop around the bounding box (height, width) in pixels.', default=44)
#    parser.add_argument('--random_order', 
#        help='Shuffles the order of images to enable alignment using multiple processes.', action='store_true')
#    parser.add_argument('--gpu_memory_fraction', type=float,
#        help='Upper bound on the amount of GPU memory that will be used by the process.', default=1.0)
#    parser.add_argument('--detect_multiple_faces', type=bool,
#                        help='Detect and align multiple faces per image.', default=False)
#    return parser.parse_args(argv)
#

    
    return True, ""