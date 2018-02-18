import os
import shutil
import base64
from mimetypes import guess_extension
import uuid
from classifier import classifier
import Helpers.align_dataset as align
from align_options import AlignOptions
import tensorflow as tf
from tensorflow.python.platform import gfile

class MyGraph():
    my_graph = None
    my_sess = None
    my_images_placeholder = None
    my_embeddings = None
    my_phase_train_placeholder = None
    
    def __init__(self):
        if MyGraph.my_graph == None:
            print("New Graph")
            # Check if the model is a model directory (containing a metagraph and a checkpoint file)
            #  or if it is a protobuf file with a frozen graph
            model_exp = os.path.expanduser("D:\\_GithubTest\\FacialRecognitionPrototype\\data\\facenet_models\\20170512-110547.pb")
            if (os.path.isfile(model_exp)):
                print('Model filename: %s' % model_exp)
                with gfile.FastGFile(model_exp,'rb') as f:
                    graph_def = tf.GraphDef()
                    graph_def.ParseFromString(f.read())
                    
                graph = tf.Graph()
                with graph.as_default():
                    tf.import_graph_def(graph_def, name='')
                    
            #    graph.finalize()
                
                # Create the session that we'll use to execute the model
            #    sess_config = tf.ConfigProto(
            #        log_device_placement=False,
            #        allow_soft_placement = True,
            #        gpu_options = tf.GPUOptions(
            #            per_process_gpu_memory_fraction=1
            #        )
            #    )
                    
                self.sess = tf.Session(graph=graph)
                
                self.images_placeholder = graph.get_tensor_by_name("input:0")
                self.embeddings = graph.get_tensor_by_name("embeddings:0")
                self.phase_train_placeholder = graph.get_tensor_by_name("phase_train:0")
                MyGraph.my_graph = graph
                MyGraph.my_sess = self.sess
                MyGraph.my_images_placeholder = self.images_placeholder
                MyGraph.my_embeddings = self.embeddings
                MyGraph.my_phase_train_placeholder = self.phase_train_placeholder
                
        else:
            self.sess = MyGraph.my_sess
            self.images_placeholder = MyGraph.my_images_placeholder
            self.embeddings = MyGraph.my_embeddings
            self.phase_train_placeholder = MyGraph.my_phase_train_placeholder
                    
#session = MyGraph()

def predict(image):
    train_data_path = "D:\_GithubTest\FacialRecognitionPrototype\data"
    temp_path = os.path.join(train_data_path, "temp")
    temp_data_path = os.path.join(temp_path, "data")
    
    if not os.path.exists(train_data_path):
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
    temp_predict = os.path.join(train_data_path, "temp_predict")
    align.align_faces(AlignOptions(temp_path, temp_predict, True))
    shutil.rmtree(temp_path)
    
    print("Classify image")
    temp_predict_data = os.path.join(temp_predict, "data")
#    pred_file_path = os.path.join(temp_predict_data, file_guid + ".png")
    
    if not os.path.exists(temp_predict_data):
        return False, None, "Could not detect face"
    
#    model_folder = "test_model"
    model_folder = "lfw500"
    model_path = os.path.join(train_data_path, model_folder)
    classifier_file = os.path.join(model_path, "classifier.pkl")
    
    success, predictions, error = classifier(mode = 'CLASSIFY', 
           model = "D:\\_GithubTest\\FacialRecognitionPrototype\\data\\facenet_models\\20170512-110547.pb",
           data_dir = temp_predict,
           session = MyGraph(),
           train_data_dir = os.path.join(model_path, "data"),
           classifier_filename = classifier_file)

    print("Cleanup...")
    shutil.rmtree(temp_predict)
    
    return True, predictions, ""