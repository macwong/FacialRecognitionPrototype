import Globals from './globals';
import Helpers from './helpers';
import $ from 'jquery';
import path from 'path';
import React from 'react';
import ReactDOM from 'react-dom';
import Predictions from './react/predictions';
import History from './react/history';
import Info from './react/info';

export class ImageProcessor {
    constructor(videoEl, canvasEl, $resultsContainer, isVideo, currentModel, verbose, currentImages, $info) {
        this.videoEl = videoEl;
        this.canvasEl = canvasEl;
        this.$resultsContainer = $resultsContainer;
        this.isVideo = isVideo;
        this.currentModel = currentModel;
        this.verbose = verbose;
        this.currentImages = currentImages;
        this.$info = $info;

        this.predictionHistory = {};

        this.reactPredictions = null;
        this.reactHistory = null;
        this.reactInfo = null;
    }

    captureImage() {
        var $resultsOverlay = this.$resultsContainer.find(".resultsOverlay");
    
        let currentWidth = this.videoEl.videoWidth;
    
        if (currentWidth === 0) {
            currentWidth = Globals.defaultWidth;
        }
    
        let currentHeight = this.videoEl.videoHeight;
    
        if (currentHeight === 0) {
            currentHeight = Globals.defaultHeight;
        }
    
        var dataURL = $(this.canvasEl).data("file_source");
    
        if (this.isVideo) {
            if (this.videoEl.src === "") {
                console.log(this.videoEl.src);
                return;
            }
    
            this.canvasEl.width = currentWidth;
            this.canvasEl.height = currentHeight;
            this.canvasEl.getContext('2d').drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height);
            var dataURL = this.canvasEl.toDataURL('image/jpeg', 1.0);
        }
    
        $.ajax({
            url: path.join(Globals.endpoint, "predict"),
            type: "POST",
            data: JSON.stringify({
                image: dataURL,
                model: this.currentModel,
                verbose: this.verbose
            }),
            contentType: "application/json; charset=utf-8",
            dataType:"json",
            
        }).done((result) => {
            Helpers.clearOverlay($resultsOverlay);
            let success = String.prototype.toLowerCase.call(result.success) === "true";
            this.createPredictions(result.predictions, success, result.error);
    
            if (this.verbose) {
                this.createHistory(result, this.$info);
            }
            
            if (this.isVideo && this.videoEl.src !== "") {
                Helpers.fadeStuff($resultsOverlay);
            }
    
            if (this.isVideo) {
                // When one request is done, do it all over again...
                this.captureImage(this.videoEl, this.canvasEl, this.$resultsContainer);
            }
            else {
                if (this.currentImages !== null && this.currentImages !== undefined && this.currentImages.length > 0) {
                    this.currentImages.shift();
                    
                    Helpers.sleep(2000).then(() => {
                        this.updateImage();
                    });
                }
            }
        }).fail((jqXHR, textStatus, errorThrown) => {
            Helpers.clearOverlay($resultsOverlay);
            this.createPredictions(null, false, jqXHR.responseJSON.error);
    
            if (this.isVideo) {
                this.captureImage(this.videoEl, this.canvasEl, this.$resultsContainer);
            }
        });
    }

    updateImage() {
        var ctx = this.canvasEl.getContext('2d');
        var img = new Image();
        img.onload = function() {
            var canvasLeft = 0;
            var canvasTop = 0;
            var imageWidth = img.width;
            var imageHeight = img.height;
    
            var ratio = 0;
    
            // Check if the current width is larger than the max
            if(imageWidth > Globals.defaultWidth){
                ratio = Globals.defaultWidth / imageWidth;   // get ratio for scaling image
                $(this).css("width", Globals.defaultWidth); // Set new width
                $(this).css("height", imageHeight * ratio);  // Scale height based on ratio
                imageHeight = imageHeight * ratio;    // Reset height to match scaled image
                imageWidth = imageWidth * ratio;    // Reset width to match scaled image
            }
            
            // Check if current height is larger than max
            if(imageHeight > Globals.defaultHeight){
                ratio = Globals.defaultHeight / imageHeight; // get ratio for scaling image
                $(this).css("height", Globals.defaultHeight);   // Set new height
                $(this).css("width", imageWidth * ratio);    // Scale width based on ratio
                imageWidth = imageWidth * ratio;    // Reset width to match scaled image
                imageHeight = imageHeight * ratio;    // Reset height to match scaled image
            }
            
            canvasLeft = (Globals.defaultWidth - imageWidth) / 2;
            canvasTop = (Globals.defaultHeight - imageHeight) / 2;
            
            let opacity = 0;
            
            (function fadeIn() {
                ctx.clearRect(0, 0, Globals.defaultWidth, Globals.defaultHeight);
                ctx.globalAlpha = opacity;
                ctx.drawImage(img, canvasLeft, canvasTop, imageWidth, imageHeight);
                opacity += 0.015;
                if (opacity < 1) {
                    requestAnimationFrame(fadeIn);
                }
            })();
    
            Helpers.fadeStuff($resultsContainer.find(".resultsOverlay"));
            this.captureImage();
        }
    
        if (this.currentImages !== null && this.currentImages !== undefined) {
            img.src = this.currentImages[0];
            $(this.canvasEl).data("file_source", this.currentImages[0]);
        }
    }
    
    createPredictions(predictions, success, error) {
        if (this.reactPredictions === null) {
            this.reactPredictions = ReactDOM.render(
                <Predictions 
                    predictions={predictions}
                    success={success}
                    error={error}
                />,
                document.getElementById("resultsContents")
            );
        }
        else {
            this.reactPredictions.updatePredictions(predictions, success, error);
        }
    }
    
    createHistory(prediction, $info) {
        if (this.reactHistory === null) {
            this.reactHistory = ReactDOM.render(
                <History 
                    predictions={prediction.predictions}
                    $info={$info}
                    infoCallback={this.createInfo}
                />,
                document.getElementById("history")
            );
        }
        else {
            this.reactHistory.updateHistory(prediction.predictions);
        }
    
        // Store in a dictionary
        for (var pred in prediction.predictions) {
            const predValues = prediction.predictions[pred];
            this.predictionHistory[predValues.prediction_id] = predValues;
        }
    }
    
    createInfo(predictionID) {
        if (this.reactInfo === null) {
            this.reactInfo = ReactDOM.render(
                <Info
                    prediction={this.predictionHistory[predictionID]}
                />,
                document.getElementById("info")
            );
        }
        else {
            this.reactInfo.updateInfo(this.predictionHistory[predictionID]);
        }
    }
}