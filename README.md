# Facial Recognition Prototype

This is a facial recognition prototype, based on David Sandberg's awesome Python FaceNet implementation:

https://github.com/davidsandberg/facenet

This prototype contains two core components:
* A Python Flask web service that provides access to the face recognition
* An Electron client that provides a UI that accesses the web service

### Purpose

The aim of this prototype is to investigate the current state of facial recognition, including:
* The accuracy of predictions
* How well it scales (e.g. predicting from a dataset of 5, 50, 500 or 5000+ people)
* The amount of training data required for a prediction to be accurate
* The ability to integrate with potential products

To evaluate these items, there were two main choices:
* Accessing a pre-existing API (such as Microsoft's Face API)
* Rolling my own solution

I decided to roll my own solution, as this will allow for a more "robust" test of what we can do with facial recognition, without the API restrictions and / or costs. Plus, writing my own facial recognition prototype is more fun :)

### Demo

Here is a run-through of what this prototype can do, including:
* How it works
* Benefits
* Potential use cases

#### 1. Training Models

The starting point of this facial recognition prototype (and indeed any machine / deep learning project) is to produce a training model.

Training models:
* Receive data as input (in this case images of people). This is commonly referred to as the "training set"
* Map "labels" to each person in the training set (for instance, a picture of Chuck Norris will be mapped to a label of "Chuck Norris")
* Use a machine learning algorithm to "learn" about the images

Once this training model has been created, we can provide the model with a new image (such as different picture of Chuck Norris). The model will then output its prediction (which should hopefully be "Chuck Norris").

Now, if we decide to pass in a picture of someone who isn't in the training set (such as Steven Seagal), then the model will obviously not be able to predict "Steven Seagal". Instead, it will predict "Chuck Norris", as this is the only person in the training set. However, there are ways that we can measure the accuracy of the predictions, which will be covered later.

![Choose Model](images/ChooseModel.png?raw=true "Title")

### Summary

### Next Steps

### Other Info
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
* User trains a model (currently only supported via web service). This can be done by using your favourite API access tool (such as Fiddler or Postman)
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
