import tensorflow as tf
from tensorflow.python.platform import gfile
import os

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
             
