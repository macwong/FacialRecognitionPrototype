# Facial Recognition Prototype

This is a facial recognition prototype, based on David Sandberg's awesome Python FaceNet implementation:

https://github.com/davidsandberg/facenet

This prototype contains two core components:
* A Python Flask web service that provides access to the face recognition
* An Electron client that provides a UI that accesses the web service

#### Features
* Predict faces from a webcam, video file and images
* Choose from different facial recognition models (default is K-Nearest Neighbour, also supports SVC)
* Predict multiple faces at once
* Display relevant info regarding each prediction, such as:
  - The probability of the prediction
  - The (euclidean) distance between the predicted image and the image(s) in the training set
  - Information about the model
  - Displaying the embeddings (the 128-dimension vector that FaceNet produces)
  - Display the top 5 predictions
  - Adding a predicted face to the training model
  - Adding new people to the training model

#### Example
* User trains a model
* Select a trained model
* Choose between the "Live", "Video" and "Image" options
* If choosing a "Video" or "Image", click on the image viewer to open a file
* Then after a couple of seconds, a prediction will be made
* To view more info, click the Less / More toggle
* Click on a prediction to view more info

#### Dependencies
* Python environment (e.g. Anaconda)
* Tensorflow
* Electron
* Node package manager

#### Video Example
Coming soon...

#### To do
* Remove all hard-coded references to my folder structure
* Python web service currently assumes that only 1 request will be done at once... will need some refactoring to allow for multiple asynchronous calls to the service
* Refactor code for public consumption
* Allow users to create models from scratch using the Electron client
* Ability to clear the history
* Ability to interchange between different face detectors. Currently using MTCNN, could possibly try DLIB which is easier to interpret (but apparently less accurate)
