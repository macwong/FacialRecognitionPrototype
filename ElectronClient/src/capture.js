const electron = require("electron");
const { remote } = electron;
const video = require("./video");
const $ = require("jquery");
const fs = require("fs");
const { dialog } = electron.remote;
const path = require('path')

const m_dataURI = "data:image/png;base64,"

let isVideo = true;
let defaultWidth;
let defaultHeight;
let currentModel;
let predictionHistory = [];

function getModels(callback) {
    let $models = $(document).find(".models");

    $.ajax({
        url: "http://localhost:5000/daveface/getmodels",
        type: "GET",
        dataType:"json"
    }).done((result) => {
        let $select = $("<select></select>");

        for (var i = 0; i < result.models.length; i++) {
            let $option = $("<option></option>");
            $option.text(result.models[i]);
            $option.val(result.models[i]);
            $select.append($option);
        }

        $models.html($select);

        currentModel = $select.find("option:first").val();

        $select.change((e) => {
            currentModel = $select.val();
        })

        callback();
    });
}

function getVideoStream(videoEl, canvasEl, $resultsContainer) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoEl.src = URL.createObjectURL(stream);

        videoEl.onloadedmetadata = (e) => {
            captureImage(videoEl, canvasEl, $resultsContainer);

        };
    }).catch(() =>  {
        alert('could not connect stream');
    });
}

$(document).ready(() => {
    const videoEl = document.getElementById("video");
    const canvasEl = document.getElementById("canvas");
    const $resultsContainer = $(document).find(".resultsContainer");
    const $history = $(document).find(".history");
    const $info = $(document).find(".info");

    getModels(() => {
        $resultsContainer.find(".resultsContents").text("Loading...");
        getVideoStream(videoEl, canvasEl, $resultsContainer);
    });

    $(document).find(".input-checkbox").change((e) => {
        let $inputCheckbox = $(e.currentTarget);

        if ($inputCheckbox.is(":checked")) {
            $history.show();
            $info.show();
        }
        else {
            $history.hide();
            $info.hide();
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

            let $video = $(videoEl);
            let $canvas = $(canvasEl);
            $video.removeClass("file");

            if ($parent.hasClass("option-live") || $parent.hasClass("option-video")) {
                $video.show();
                $canvas.hide();
                isVideo = true;

                if ($parent.hasClass("option-live")) {
                    getVideoStream(videoEl, canvasEl, $resultsContainer);
                }
                else {
                    $video.addClass("file");
                    $video.prop("src", "");

                }
            }
            else if ($parent.hasClass("option-image")) {
                $(canvasEl).show();
                $video.hide();
                isVideo = false;
            }
        }
    });

    $(canvasEl).click((e) => {
        dialog.showOpenDialog(
            remote.getCurrentWindow(),
            {
                defaultPath: 'c:/',
                filters: [
                    { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
                  ],
                properties: ['openFile']
            },
            function (filePaths) {
                var ctx = canvasEl.getContext('2d');
                var img = new Image();
                img.onload = function() {
                    var canvasLeft = 0;
                    var canvasTop = 0;
                    var imageWidth = img.width;
                    var imageHeight = img.height;

                    var ratio = 0;

                    // Check if the current width is larger than the max
                    if(imageWidth > defaultWidth){
                        ratio = defaultWidth / imageWidth;   // get ratio for scaling image
                        $(this).css("width", defaultWidth); // Set new width
                        $(this).css("height", imageHeight * ratio);  // Scale height based on ratio
                        imageHeight = imageHeight * ratio;    // Reset height to match scaled image
                        imageWidth = imageWidth * ratio;    // Reset width to match scaled image
                    }
                    
                    // Check if current height is larger than max
                    if(imageHeight > defaultHeight){
                        ratio = defaultHeight / imageHeight; // get ratio for scaling image
                        $(this).css("height", defaultHeight);   // Set new height
                        $(this).css("width", imageWidth * ratio);    // Scale width based on ratio
                        imageWidth = imageWidth * ratio;    // Reset width to match scaled image
                        imageHeight = imageHeight * ratio;    // Reset height to match scaled image
                    }
                    
                    canvasLeft = (defaultWidth - imageWidth) / 2;
                    canvasTop = (defaultHeight - imageHeight) / 2;
                    ctx.clearRect(0, 0, defaultWidth, defaultHeight);
                    ctx.drawImage(img, canvasLeft, canvasTop, imageWidth, imageHeight);
                    fadeStuff($resultsContainer.find(".resultsOverlay"));
                    captureImage(videoEl, canvasEl, $resultsContainer);
                }

                img.src = filePaths[0];
                $(canvasEl).data("file_source", filePaths[0]);
            }
        );
    });
});

function captureImage(videoEl, canvasEl, $resultsContainer) {
    var $resultsContents = $resultsContainer.find(".resultsContents");
    var $resultsOverlay = $resultsContainer.find(".resultsOverlay");
    var $history = $(document).find(".history");
    var $info = $(document).find(".info");
    defaultWidth = videoEl.videoWidth;
    defaultHeight = videoEl.videoHeight;
    var dataURL = $(canvasEl).data("file_source");

    if (isVideo) {
        canvasEl.width = defaultWidth;
        canvasEl.height = defaultHeight;
        canvasEl.getContext('2d').drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
        var dataURL = canvasEl.toDataURL('image/jpeg', 1.0);
    }

    $.ajax({
        url: "http://localhost:5000/daveface/predict",
        type: "POST",
        data: JSON.stringify({
            image: dataURL,
            model: currentModel
        }),
        contentType: "application/json; charset=utf-8",
        dataType:"json",
        
    }).done((result) => {
        clearOverlay($resultsOverlay);

        if(String.prototype.toLowerCase.call(result.success) === "true") {
            var arrayLength = result.predictions.length;

            if (arrayLength === 0) {
                $resultsContents.text("Dude! You're invisible!");
            }
            else {
                $resultsContents.empty();
                let $recentHistory = $("<div></div>");

                for (var i = 0; i < arrayLength; i++) {
                    if (i == 0) {
                        let $time = $("<div></div>");
                        $time.addClass("prediction-time");
                        $time.text(result.predictions[i].pred_time);
                        $recentHistory.append($time);
                    } 

                    createPhoto(result.predictions[i], $resultsContents, "person");
                    $recentHistory.append(createHistory(result.predictions[i], $history, $info));
                }

                $history.prepend($recentHistory.children());

                if (isVideo) {
                    fadeStuff($resultsOverlay);
                }
            }
        }
        else {
            $resultsContents.text(result.error);
        }

        if (isVideo) {
            // When one request is done, do it all over again...
            captureImage(videoEl, canvasEl, $resultsContainer);
        }
    }).fail((jqXHR, textStatus, errorThrown) => {
        clearOverlay($resultsOverlay);
        
        $resultsContents.text(jqXHR.responseJSON.error);
        
        if (isVideo) {
            captureImage(videoEl, canvasEl, $resultsContainer);
        }
    });
}

function fadeStuff($resultsOverlay) {
    $resultsOverlay.fadeTo(7500, 1.0);
}

function clearOverlay($resultsOverlay) {
    $resultsOverlay.stop(true).css('opacity', '0.0');
}

function createHistory(pred_result, $history, $info) {
    // A row of data in the history column
    // <div class="row">
    //     <img class="predicted-image" src="../images/like.png" />
    //     <div class="row-text">
    //         <div class="name">David McCormick</div>
    //         <div class="time">26/02/2018 02:40:55 PM</div>
    //         <div class="rating">
    //             <img src="../images/verified.png" />
    //             <img src="../images/verified.png" />
    //             <img src="../images/verified.png" />
    //             <img src="../images/verified.png" />
    //             <img src="../images/verified.png" />
    //         </div>
    //     </div>
    // </div>

    predictionHistory.push(pred_result);

    let $row = $("<div></div>");
    $row.data("prediction_id", pred_result.prediction_id);
    $row.addClass("row interactive");

    let $face = $("<img />");
    $face.addClass("predicted-image");
    $face.prop("src", m_dataURI + pred_result.image);

    let $rowText = $("<div></div>");
    $rowText.addClass("row-text");
    $rowText.text(pred_result.pred_name);

    let $name = $("<div></div>");
    $name.addClass("name");

    let $time = $("<div></div>");
    $time.addClass("time");
    $time.text(pred_result.pred_time);

    let $rating = $("<div></div>");
    $rating.addClass("rating");

    let $icon = $("<img />");
    pred_info = setPredictionIcon(pred_result.info, pred_result.pred_name, $icon);

    let ratingCount = 5;

    if (pred_info !== null) {
        ratingCount = getRating(pred_info.distance);
    }

    $row.append($face);
    $rowText.append($name);
    $rowText.append($time);

    for (var rate = 0; rate < ratingCount; rate++) {
        $rating.append($icon.clone());
    }

    $rowText.append($rating);
    $row.append($rowText);

    $row.click((e) => {
        createInfo($(e.currentTarget), $info);
    });

    return $row;
}

function createInfo($row, $info) {
    $info.empty();

    let $container = $("<div></div>").load(path.join(__dirname, 'info.html'));

    $.get(path.join(__dirname, 'info.html'), (data) => {
        let predictionID = $row.data("prediction_id");
        let pred_result = $.grep(predictionHistory, (prediction) => { return prediction.prediction_id == predictionID });

        if (pred_result.length !== 1) {
            return;
        }
        
        result = pred_result[0];
        
        let pred_name = result.pred_name;
        let $contents = $("<div></div>").html(data);
        let $figure = $contents.find("figure");
        
        $figure.find(".profile-pic").prop("src", m_dataURI + result.image);
        $figure.find(".caption h2").text(pred_name);
        setPredictionIcon(result.info, pred_name, $figure.find(".icon"));
        
        let $scores = $contents.find(".scores");
        $scores.find(".probability").text(getProbability(result.probability));
        $scores.find(".distance").text(result.distance.toFixed(2));
        
        let $topPredictions = $contents.find(".top-predictions");
        let $predictionList = $topPredictions.find(".prediction-list");
        let $expandable = $topPredictions.find(".expandable");
        $predictionList.hide();
        
        $expandable.click((e) => {
            if ($topPredictions.hasClass("collapsed")) {
                $topPredictions.removeClass("collapsed");
                $predictionList.slideDown();
            }
            else {
                $topPredictions.addClass("collapsed");
                $predictionList.slideUp();
            }
        });

        $.get(path.join(__dirname, 'toppredictionsrow.html'), (rowData) => {
            let $rowTemplate = $(rowData);
            let $rowName = $rowTemplate.find(".top-name");
            let $rowRating = $rowTemplate.find(".rating");
            let $ratingImage = $rowRating.find("img:first");
            let $training = $rowTemplate.find(".training-images");
            let $trainingImage = $training.find("img:first");
            let $rowScores = $rowTemplate.find(".top-scores");

            for (var infoIndex in result.info) {
                let info = result.info[infoIndex];
                let rank = Number(infoIndex) + 1;
                $rowName.find(".top-name-heading").text(rank + ". " + info.name);

                let rating = getRating(info.distance);
                $rowRating.empty();
                setPredictionImage($ratingImage, info.distance);

                for (var i = 0; i < rating; i++) {
                    $rowRating.append($ratingImage.clone());
                }

                $training.empty();

                for (var i = 0; i < info.photo_path.length; i++) {
                    let photo_path = info.photo_path[i];
                    $trainingImage.prop("src", photo_path);
                    $training.append($trainingImage.clone());
                }

                $rowScores.find(".probability").text(getProbability(info.probability));
                $rowScores.find(".distance").text(info.distance.toFixed(2));

                $predictionList.append($rowTemplate.clone());
            }
        });

        $info.html($contents.children());
    });
}

function getProbability(probability) {
    prob = probability * 100;
    prob = prob.toFixed(2);
    return prob + "%";
}

function createPhoto(result, $resultsContents, figureClass) {
    // Person in results on bottom
    // <figure class="person">
    //     <img />
    //     <figcaption class="caption">
    //         David McCormick
    //     </figcaption>
    //     <img src="../images/verified.png" />
    // </figure>

    pred_name = result.pred_name;
    let $figure = $("<figure></figure>");
    $figure.addClass(figureClass);

    let $image = $("<img />");
    $image.prop("src", m_dataURI + result.image);

    let $figCaption = $("<figcaption></figcaption>");
    $figCaption.addClass("caption");
    $figCaption.text(pred_name);

    let $icon = $("<img />")
    $icon.addClass("icon");
    setPredictionIcon(result.info, pred_name, $icon);
    
    $figure.append($image);
    $figure.append($figCaption);
    $figure.append($icon);

    $resultsContents.append($figure);
}

function setPredictionIcon(info, pred_name, $icon) {
    for (var pred in info) {
        let train_name = info[pred].name;
        
        if (train_name === pred_name) {
            distance = info[pred].distance;
            setPredictionImage($icon, distance);
            return info[pred];
        }
    }

    return null;
}

function getRating(distance) {
    if (distance < 0.75) {
        return 5;
    }
    else if (distance < 0.9) {
        return 4;
    }
    else if (distance < 1.05) {
        return 3;
    }
    else if (distance < 1.2) {
        return 2;
    }
    else {
        return 1;
    }
}

function setPredictionImage($icon, distance) {
    if (distance < 0.75) {
        $icon.prop("src", "../images/verified.png");
    }
    else if (distance < 0.9) {
        $icon.prop("src", "../images/like.png");
    }
    else if (distance < 1.05) {
        $icon.prop("src", "../images/maybe.png");
    }
    else if (distance < 1.2) {
        $icon.prop("src", "../images/noidea.png");
    }
    else {
        $icon.prop("src", "../images/rotten.png");
    }
}