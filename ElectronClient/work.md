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
3. Converts the face images into a more effective format (from raw pixels to numerical values that contain a more semantic understanding of the face)
4. Using these numerical values, use a machine learning algorithm to predict who the face(s) are

However, before predictions can be made, a "training model" is required. A training model uses a machine learning algorithm to "learn" about people's faces, including identifying who each face is.

#### Training models

Training models contain the following:
* Dataset (i.e. images of people's faces). These faces are people that the facial recognition system is aware of, and all predictions will be based off these people. For example, if the system only has "Chuck Norris" in the dataset, then all predictions will be of "Chuck Norris" (although there are ways of measuring the veracity of predictions, which will be covered later)
* Labels (i.e. identifying each person to predict from). These labels are typically numerical IDs, and are mapped to both images in the dataset, as well as people's names. For instance, A label with ID "1" could be "Chuck Norris", which map to 1 or more images of his face
* Training process (using a machine learning algorithm). The aim of the training process is for the system to "learn" who people are, based on the provided dataset and labels. Firstly, there is some pre-processing conducted on the dataset (i.e. the same process as steps 2 and 3 in the above "Prediction Process"). Then, a machine learning algorithm is used to teach the system to identify the people in the dataset. The same algorithm needs to be used for both the training model and the prediction process

Video example (press Cmd / Ctrl + Click on the image below to open in a new tab):

[![Training a model](https://img.youtube.com/vi/WOgDWFbLLRQ/0.jpg)](https://www.youtube.com/watch?v=WOgDWFbLLRQ)

## Prototype features

#### Creating and choosing training models

#### Predictions from image, video and webcam input

#### Displays history of predictions

#### Calculates the accuracy of predictions

#### Provides a "Top 5" for each prediction

#### Ability to add new faces

#### Provides model and image info

## Potential use cases

## Verdict

## Next steps


