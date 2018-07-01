import React, {Component} from 'react';
import Viewer from './viewer';
import Globals from '../globals';
import Helpers from '../helpers';
import electron from 'electron';
import {remote} from 'electron';
import $ from 'jquery';

import ReactDOM from 'react-dom';
import Predictions from './predictions';
import History from './history';
import Info from './info';
import path from 'path';

const { dialog } = electron.remote;

export default class App extends Component {
    constructor(props) {
        super(props);

        this.videoEl = null;
        this.canvasEl = null;
        this.$resultsContainer = null;
        this.$history = null;
        this.$info = null;

        this.$resultsOverlay = null;
        this.isVideo = true;
        this.currentModel = "";
        this.verbose = false;
        this.currentImages = [];
        this.predictionHistory = {};

        this.reactPredictions = null;
        this.reactHistory = null;
        this.reactInfo = null;

        this.state = {
            predictions: []
        };
    }

    render() {
        return (
            <div className="container">
                <div className="videoContainer">
                    <div className="column column-one">
                        <History 
                            predictions={this.state.predictions}
                            infoCallback={this.createInfo.bind(this)}
                        />
                    </div>
                    <div className="column column-two">
                        <Viewer />
                    </div>
                    <div className="column column-three">
                        <div id="info">
                        </div>
                    </div>
                </div>
                <div id="resultsContainer" className="resultsContainer">
                    <div id="resultsContents" className="resultsContents"></div>
                    <div id="resultsOverlay" className="resultsOverlay"></div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.videoEl = document.getElementById("video");
        this.canvasEl = document.getElementById("canvas");
        this.$resultsContainer = $(document.getElementById("resultsContainer"));
        this.$history = $(document.getElementById("history"));
        this.$info = $(document.getElementById("info"));
        this.$resultsOverlay = this.$resultsContainer.find(".resultsOverlay");

        this.initApp(() => {
            this.$resultsContainer.find(".resultsContents").text("Loading...");
            this.getVideoStream();
        });
    
        $(document).find(".input-checkbox").change((e) => {
            let $inputCheckbox = $(e.currentTarget);
    
            if ($inputCheckbox.is(":checked")) {
                this.$history.show();
                this.$info.show();
                this.verbose = true;
            }
            else {
                this.$history.hide();
                this.$info.hide();
                this.verbose = false;
            }
        });
    
        let $segment = $(".segmented label input[type=radio]");
    
        $segment.on("change", (e) => {
            let $option = $(e.currentTarget);
            let $parent = $option.parent();
    
            if($option.is(":checked")) {
                $parent.siblings().each((sigIndex, sibValue) => {
                    $(sibValue).removeClass("checked");
                });
    
                $parent.addClass("checked");
    
                let $video = $(this.videoEl);
                $video.prop("controls", false);
    
                if ($parent.hasClass("option-live") || $parent.hasClass("option-video")) {
                    $video.show();
                    $(this.canvasEl).hide();
                    this.isVideo = true;
    
                    if ($parent.hasClass("option-live")) {
                        this.getVideoStream();
                    }
                    else {
                        $video.addClass("file");
                        $video.prop("src", "");
                        $video.removeAttr("src");
                    }
                }
                else if ($parent.hasClass("option-image")) {
                    if ($video.hasClass("file")) {
                        $video.removeClass("file");
    
                        this.canvasEl.width = Globals.defaultWidth;
                        this.canvasEl.height = Globals.defaultHeight;
                    }
                    
                    $video.hide();
                    $video.prop("src", "");
                    $video.removeAttr("src");
                    $(this.canvasEl).show();
                    this.isVideo = false;
                }
            }
        });
    
        $(this.videoEl).click((e) => {
            if ($(e.currentTarget).hasClass("file")) {
                this.openVideo();
            }
        });
    
        $(this.canvasEl).click((e) => {
            this.openImage();
        });
    }

    initApp(callback) {
        let $models = $(document).find(".models");
        let $select = $("<select></select>");
    
        this.getModels($select).then(() => {
            $models.html($select);
    
            this.currentModel = $select.find("option:first").val();
    
            $select.change((e) => {
                this.currentModel = $select.val();
            })
    
            $('.add-model').on('click', (e) => {
                e.preventDefault();
    
                $.get(path.join(__dirname, 'modal.html'), (data) => {
                    let $modal = $(data);
                    let $name = $modal.find(".model-name");
                    let $folderLocation = $modal.find(".folder-location");
                    let $algorithm = $modal.find(".algorithm");
                    let $loading = $modal.find(".loading");
    
                    $(document.body).append($modal);
    
                    setTimeout(() => {
                        $modal.addClass('is-visible');
                    }, 50);
    
                    $modal.find(".modal-toggle").click((e) => {
                        $modal.removeClass('is-visible');
                        
                        $modal.on('transitionend', (e) => {
                            //when transition is finished you remove the element.
                            $modal.remove();
                        });
                    });
    
                    $modal.find(".choose-folder").click((e) => {
                        dialog.showOpenDialog(
                            remote.getCurrentWindow(), {
                                properties: ['openDirectory']
                            },
                            (filePaths) => {
                                $folderLocation.val(filePaths[0]);
                            }
                        );
                    });
    
                    $modal.find(".model-add").click((e) => {
                        $loading.addClass("is-visible");
    
                        $.ajax({
                            url: path.join(Globals.endpoint, "train"),
                            type: "POST",
                            data: JSON.stringify({
                                input_folder_path: $folderLocation.val(),
                                model_folder_name: $name.val(),
                                model_type: $algorithm.val()
                            }),
                            contentType: "application/json; charset=utf-8",
                            dataType:"json",
                            
                        }).done((result) => {
                            $loading.removeClass("is-visible");
                            $modal.removeClass('is-visible');
                        
                            $modal.on('transitionend', (e) => {
                                //when transition is finished you remove the element.
                                $modal.remove();
                            });
    
                            this.getModels($select).then(() => {
                                $select.val(this.currentModel);
                            });
                        }).fail((jqXHR, textStatus, errorThrown) => {
                            $loading.removeClass("is-visible");
                            let $errorMsg = $modal.find(".error-message");
                            $errorMsg.text(jqXHR.responseJSON.error);
                        });
                    });
                });
            });
    
            callback();
        });
    }
    
    getVideoStream() {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            this.videoEl.src = URL.createObjectURL(stream);
    
            this.videoEl.onloadedmetadata = (e) => {
                this.captureImage();
            };
        }).catch(() =>  {
            alert('could not connect stream');
        });
    }
    
    getModels($select) {
        var deferred = $.Deferred();
    
        $.ajax({
            url: path.join(Globals.endpoint, "getmodels"),
            type: "GET",
            dataType:"json"
        }).done((result) => {
            $select.empty();
    
            for (var i = 0; i < result.models.length; i++) {
                let $option = $("<option></option>");
                $option.text(result.models[i]);
                $option.val(result.models[i]);
                $select.append($option);
            }
    
            deferred.resolve();
        });
    
        return deferred.promise();
    }

    openVideo() {
        dialog.showOpenDialog(
            remote.getCurrentWindow(),
            {
                defaultPath: 'c:/',
                filters: [
                    { name: 'Images', extensions: ['avi', 'mov', 'mkv', 'mp4'] }
                  ],
                properties: ['openFile']
            },
            (filePaths) => {
                $(this.videoEl).prop("controls", true);
                
                Helpers.fadeStuff(this.$resultsContainer.find(".resultsOverlay"));
                this.captureImage();
    
                this.videoEl.src = filePaths[0];
            }
        );    
    }
    
    openImage() {
        dialog.showOpenDialog(
            remote.getCurrentWindow(),
            {
                defaultPath: 'c:/',
                filters: [
                    { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
                  ],
                properties: ['openFile', 'multiSelections']
            },
            (filePaths) => {
                this.currentImages = filePaths;
                this.updateImage();
            }
        );
    }
    
    captureImage() {
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
            Helpers.clearOverlay(this.$resultsOverlay);
            let success = String.prototype.toLowerCase.call(result.success) === "true";
            this.createPredictions(result.predictions, success, result.error);
    
            if (this.verbose) {
                this.createHistory(result);
            }
            
            if (this.isVideo && this.videoEl.src !== "") {
                Helpers.fadeStuff(this.$resultsOverlay);
            }
    
            if (this.isVideo) {
                // When one request is done, do it all over again...
                this.captureImage();
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
            Helpers.clearOverlay(this.$resultsOverlay);
            this.createPredictions(null, false, jqXHR.responseJSON.error);
    
            if (this.isVideo) {
                this.captureImage();
            }
        });
    }

    updateImage() {
        var ctx = this.canvasEl.getContext('2d');
        var img = new Image();
        img.onload = () => {
            var canvasLeft = 0;
            var canvasTop = 0;
            var imageWidth = img.width;
            var imageHeight = img.height;
    
            var ratio = 0;
    
            // Check if the current width is larger than the max
            if(imageWidth > Globals.defaultWidth){
                ratio = Globals.defaultWidth / imageWidth;   // get ratio for scaling image
                $(img).css("width", Globals.defaultWidth); // Set new width
                $(img).css("height", imageHeight * ratio);  // Scale height based on ratio
                imageHeight = imageHeight * ratio;    // Reset height to match scaled image
                imageWidth = imageWidth * ratio;    // Reset width to match scaled image
            }
            
            // Check if current height is larger than max
            if(imageHeight > Globals.defaultHeight){
                ratio = Globals.defaultHeight / imageHeight; // get ratio for scaling image
                $(img).css("height", Globals.defaultHeight);   // Set new height
                $(img).css("width", imageWidth * ratio);    // Scale width based on ratio
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
    
            Helpers.fadeStuff(this.$resultsOverlay);

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
    
    createHistory(prediction) {
        this.setState({
            predictions: prediction.predictions
        });
    
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