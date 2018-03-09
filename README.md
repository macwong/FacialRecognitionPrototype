# Facial Recognition Prototype

This is a facial recognition prototype, based on David Sandberg's awesome FaceNet implementation:

https://github.com/davidsandberg/facenet

This prototype contains two core components:
* A Python Flask web service that provides access to the face recognition
* An Electron client that provides a UI that accesses the web service

### Features
* Predict faces from a webcam, video file and images
* Choose from different models

### How it works

### Installation

### How to use

### Example

### To do
* Python web service currently assumes that only 1 request will be done at once... will need some refactoring to allow for multiple asynchronous calls to the service
* Refactor code for public consumption
* Allow users to create models from scratch using the Electron client
* Ability to clear the history
* Ability to interchange between different face detectors. Currently using MTCNN, could possibly try DLIB which is easier to interpret (but apparently less accurate)
