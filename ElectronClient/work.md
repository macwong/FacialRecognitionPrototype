# Facial Recognition Prototype

## Introduction

Facial recognition technologies are currently integrated into various products and solutions:
* Facebook has the ability to automatically identify and tag our photos
* Apple integrate Face ID into some of their iPhones to authenticate a user
* Law enforcement and security companies integrate the tech into their products in order to identify people in surveillance videos (video recordings as well as real-time)
* Advertising companies are beginning to use facial recognition to provide tailored ads

Whilst some of these companies are starting to integrate facial recognition into their products, the technology is still fairly new. Therefore, investigating the capabilities of the tech will help in knowing whether it is worth integrating into our products.

This article provides the results of my investigation into facial recognition. As well as this article, I have written a prototype that shows the capabilities of facial recognition. 

This article covers:
* Why are we investigating this tech?
* Basic facial recognition concepts
* Prototype features
* Potential use cases
* Verdict
* Next steps

## Why are we investigating this tech?

The aim of this investigation is to identify the feasibility of implementing facial recognition into our products. This includes:
* Measuring the accuracy of facial recognition predictions (including the sensitivity to variables such as different lighting conditions, facial positions and expressions)
* Finding out the threshold of how many people can be predicted upon before the system becomes too slow and / or inaccurate (e.g. identifying a person amongst 5, 50, 500 or even 5000 people)
* Testing the speed of predictions, to see if predictions can be made in real-time
* Checking whether we can identify people that the system doesn't know about, and possibly adding these people to the system on-the-fly

## Basic facial recognition concepts

#### Prediction process

Here is a high-level overview of what a typical facial recognition system performs:
1. Receives an input (e.g. image, video or live cam of a person). If using video or camera, then takes snapshot images at given intervals
2. Uses face detection to find all faces in the input image, and creates separate images for each
3. Converts the face images into a more effective format (from raw pixels to 128 numerical values that contain a more semantic understanding of the face)
4. Using these numerical values, use a machine learning algorithm to predict who the face(s) are

However, before predictions can be made, a "training model" is required. A training model uses a machine learning algorithm to "learn" about people's faces, including identifying who each face is.

#### Training models

Training models contain the following:
* Dataset (i.e. images of people's faces). These faces are people that the facial recognition system is aware of, and all predictions will be based off these people. For example, if the system only has "Chuck Norris" in the dataset, then all predictions will be of "Chuck Norris" (although there are ways of measuring the veracity of predictions, which will be covered later)
* Labels (i.e. identifying each person to predict from). These labels are typically numerical IDs, and are mapped to both images in the dataset, as well as people's names. For instance, A label with ID "1" could be "Chuck Norris", which map to 1 or more images of his face
* Training process (using a machine learning algorithm). The aim of the training process is for the system to "learn" who people are, based on the provided dataset and labels. Firstly, there is some pre-processing conducted on the dataset (i.e. the same process as steps 2 and 3 in the above "Prediction Process"). Then, a machine learning algorithm is used to teach the system to identify the people in the dataset. The same algorithm needs to be used for both the training model and the prediction process

#### Technologies used in prototype

To evaluate facial recognition, there were two main choices:

* Accessing a pre-existing API (such as Microsoft's Face API)
* Rolling my own solution

I decided to roll my own solution, as this will allow for a more "robust" test of what we can do with facial recognition, without the API restrictions and / or costs. Plus, writing my own facial recognition prototype is more fun :)

The prototype contains two core components:

* A Python Flask web service that provides access to the face detection and recognition
* An Electron client that provides a UI that accesses the web service

The Python Flask service contains the following:
* A face detector that uses the MTCNN neural network. This ensures that main landmarks of the face (e.g. face, nose, mouth) are in a similar position for each photo
* The FaceNet algorithm that converts a face to a 128-dimension vector. FaceNet was created as part of a Google research paper, and David Sandberg has created an awesome Python FaceNet implementation:

https://github.com/davidsandberg/facenet

* A machine learning algorithm (a choice between K-Nearest Neighbours and Support Vector Classification) that is used to train a model and predict faces.

The client uses Electron, which allows developers to build cross platform desktop apps with JavaScript, HTML, and CSS. It contains the following:
* Ability to receive image input (via photos, videos or webcam)
* Pass the image input to the Python web service in order to make predictions
* Get responses from the Python web service, and display the results 

## Prototype features

#### Creating and choosing training models

The prototype provides the ability to create a new training model. The user needs to provide the following:
* The model's name (e.g. "Test Model")
* The image folder (i.e. a folder on the computer that contains the images)
* The algorithm (currently a choice between K-Nearest Neighbours and Support Vector Classification... although one day would like to add LSH Forests to the list, as it's a much quicker version of K-Nearest Neighbours)

For the image folder, it needs to have the following format:

* [Parent Folder]
   * Dave McCormick
   		* dave01.png
   		* testdave02.jpg
   * Chuck Norris
   		* [Image01.png]
   		* [Image02.png]
   * Angelina Jolie
   		* [Image01.png]

Then when creating the model, the app will extract the names from the folder name (e.g. "Dave McCormick"), and map the folder name to both a label (e.g. Label ID "0") and the images (e.g. "dave01.png" and "testdave02.png").

There is also a choice of algorithm, but from basic tests, K-nearest neighbours seems to be a more consistent algorithm in most cases.

Once a model has been created, it can be chosen as the main training model. Then, predictions will be made based on the model.

Below is a video example of creating a model, then using the newly created model for making predictions (hopefully Confluence auto-embeds youtube vids... otherwise, press Cmd / Ctrl + Click on the image below to open in a new tab):

[![Training a model](https://img.youtube.com/vi/WOgDWFbLLRQ/0.jpg)](https://www.youtube.com/watch?v=WOgDWFbLLRQ)

#### Predictions from image, video and webcam input

Predictions can be made from a variety of input sources:
* Images: the user can select one or more images from their file system
* Video: the user can select a video from their file system
* Live: input coming from the webcam

Here is a video showing the different input options, and how they can be used to make face predictions:

https://youtu.be/R8ikzYLrFLc

#### Predictions in real-time

https://youtu.be/XXTHB1FZj_U

#### Can predict from a large dataset of faces

Typically, the more people that the system has to predict from, the more likely that the system will be incorrect. For instance, if there are only 10 people (including myself) in the dataset, then it should be easy to predict a new picture of me. However, if there are 5000+ people, then it should be much harder for the prediction to be accurate (as there is a higher likelihood of more people who look similar).

The largest dataset that I used for testing was the "Labeled Faces in the Wild" (LFW) face dataset. This contains the following:
* 5749 people
* 13233 images of faces
* 1680 people with two or more face images
* 4069 people with only one face image

Despite this being a (relatively) large dataset, the predictions are still both (surprisingly) accurate and reasonably fast.

Using a data science approach, we can do a 1 vs 1 comparison of all 13233 faces in the dataset, to measure the accuracy:
* True Positive (TP): two faces are validated as the same person, and they are indeed the same
* True Negative (TN): two faces are judged as different people, and they are indeed different
* False Positive (FP): two faces are validated as the same person, but the truth is that they are different
* False Negative (FN): two faces are judged as different people, but the truth is that they are the same person

Using the above 4 values, we can calculate the accuracy using the following formula:

(TP + TN) / (TP + TN + FP + FN)

Using this formula, we can get an accuracy of 99.2% (+-0.003).

Anecdotally, I find that the predictions aren't always this accurate (especially from a low quality webcam), but still provide decent results that could generally be relied upon for most non-critical uses.

Performance-wise, predictions are generally taking between 2 and 3 seconds, even with the large dataset. This time could be cut down with more efficient algorithms and code.

#### Robust predictions

The facial recognition prototype is fairly robust to the following variables:
- Facial expressions
- Multiple faces
- Age differences
- Makeup differences
- Lighting conditions
- Occlusions
- Doppelgangers

The prototype can make successful predictions even with various facial expressions (such as smiling, frowning, or "alternative" expressions). Here is a video outlining this:

https://youtu.be/KIF6Xc6uujw

Object occlusion (i.e. objects that get in the way of the face, such as sunglasses or a hand) can still result in accurate predictions, however the predictions get less confident with the higher rate of occlusion. With too much occlusion, predictions start to become incorrect.

The algorithm also seems extremely robust to lighting conditions, where correct predictions can be made even with different white balance (coloured lighting), brightness (almost to silhouette darkness) and inconsistent light. 

Here is a video of the various conditions that the prototype can handle:

https://youtu.be/932r6Uq4SZI

#### Calculates the accuracy of predictions

The accuracy of each prediction is displayed in two ways:
* Probabilility: The machine learning algorithm provides a percentage probability of the face input. This probability is sensitive to the data in the training model, therefore is an inconsistent metric for evaluating accuracy
* Distance: A comparison between the 128-dimension vector of the face input vs the 128-dimension vector of the training images. This calculates the "euclidean distance" between the two vectors, and the shorter the distance, the more likely that the prediction is correct. The distance is a direct comparison, without considering other data in the training model, therefore is a good way of measuring the accuracy

The prototype uses the Distance to evaluate the accuracy of predictions, using the following scores:
* 5: Twitter verified: The likelihood of the prediction being accurate is very high. Distance is less than 0.75
* 4: Facebook like: Reasonable prediction. Distance is between 0.75 and 0.9
* 3: Not sure: Starting to guess. Distance is between 0.9 and 1.05
* 2: Sad face: Unlikely to be accurate, and is more likely to be an unknown person. Distance is between 1.05 and 1.2
* 1: Rotten tomato: Poor prediction. Is most likely unknown to the dataset, or a very poor image sample. Distance is larger than 1.2

Here is a video that shows the difference between these 5 scores:

https://youtu.be/PouD_K-1_fw

#### Provides a "Top 5" for each prediction

For each predicted face, the user can see the top 5 most likely predictions. Here is a video covering this:

https://youtu.be/BZgsosfM4z0

#### Ability to add new faces

The user of the prototype has the ability to add new faces to the training model for the following two situations:
* Adding a face to an existing person
* Adding a new person

https://youtu.be/2j9xxTAyl84

#### Provides model and image info
For each prediction, the prototype can display a historical list of all predictions made. This allows us to click on each prediction, in order to see more info, such as:
* Model name
* Total people in model
* Total images in model
* Algorithm details
* People in model dataset
* FaceNet embeddings (the 128-dimension vector)

Here is an example video:

https://youtu.be/9HIzk_G8Eco

## Potential use cases

* Quicker Check-In / Out: when the student walks up to the front desk, we could have the user's details automatically displayed in StarRez Web. When the receptionist confirms that the prediction is correct, they can quickly check in
* Automatic greetings: When the student walks into reception or even their room, an app could automatically greet them using a TV monitor or a text to speech system
* Verifying students / visitors: Automatically detecting that all people walking through the halls are accounted for
* Surveillance of incidents: Processing surveillance videos to find out if any students were part of an incident

## Verdict

The facial recognition tech is much more powerful than anticipated, and we could potentially be integrating this tech into our products.

## Next steps

There are two main directions that we can go from here:
* Compare this prototype with API offerings (such as Microsoft's Face API). This will allow us to verify whether the API can do what this baseline prototype can do.
* Build upon the code written in the prototype, to make it production-ready.

If we were to build upon the prototype, then here are some actions that we can take:
* Refactor code to be less hacky. For the prototype I have focused mainly on functionality rather than code cleanliness, which would have to change if we were to release to a production environment.
* Investigate how to deploy to production. Since the facial recognition side of things is written in Python, we'll need to work out how to deploy this. The prototype uses a Python Flask web service, so we could potentially keep this service layer.
* Authenticate service layer: If we were to use something like Python Flask, we would need to authenticate using similar mechanisms to our REST service APIs.
* Remove dependency on GPU. Currently, we're using the GPU to do most of the maths computations. Whilst cloud GPUs are getting cheaper, it would be much cheaper if we didn't need them at all
* Improve performance. If we remove the GPU dependency, then we'll need to work out how to make the predictions faster in order to continue doing real-time predictions.

In the comments of the following YouTube clip, the developer mentions that they could potentially make 5-10 predictions per second on CPU, which would be pretty sweet:

https://www.youtube.com/watch?v=T6czH6DLhC4

* Run on mobile device. If we are able to run this in real-time on CPU, then we could potentially run this in real-time on mobile devices as well. Android has a Tensorflow framework, not sure about ios.

