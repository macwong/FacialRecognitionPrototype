const electron = require("electron");
const { remote } = electron;
const video = require("./video");
const $ = require("jquery");
const fs = require("fs");
const { dialog } = electron.remote;

const m_dataURI = "data:image/png;base64,"

let isVideo = true;
let defaultWidth;
let defaultHeight;
let currentModel;
let history = [];

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

$(document).ready(() => {
    const videoEl = document.getElementById("video");
    const canvasEl = document.getElementById("canvas");
    const $resultsContainer = $(document).find(".resultsContainer");
    const $history = $(document).find(".history");

    getModels(() => {
        navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
            $resultsContainer.find(".resultsContents").text("Loading...")
    
            var cam = document.getElementById('video')
            cam.src = URL.createObjectURL(stream);
    
            cam.onloadedmetadata = function(e) {
                captureImage(videoEl, canvasEl, $resultsContainer);
    
            };
        }).catch(() =>  {
            alert('could not connect stream');
        });
    });

    $(document).find(".input-checkbox").change((e) => {
        let $inputCheckbox = $(e.currentTarget);

        if ($inputCheckbox.is(":checked")) {
            console.log("Show busy mode");
            $history.show();
        }
        else {
            console.log("Hide busy mode");
            $history.hide();
        }
    });

    $(".segmented label input[type=radio]").each(function(){
        $(this).on("change", function(){
            if($(this).is(":checked")){
               $(this).parent().siblings().each(function(){
                    $(this).removeClass("checked");
                });
                $(this).parent().addClass("checked");

                if ($(this).parent().hasClass("option-video")) {
                    $(videoEl).show();
                    $(canvasEl).hide();
                    isVideo = true;
                    captureImage(videoEl, canvasEl, $resultsContainer);
                }
                else if ($(this).parent().hasClass("option-image")) {
                    $(canvasEl).show();
                    $(videoEl).hide();
                    isVideo = false;
                }
            }
        });
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
                
                for (var i = 0; i < arrayLength; i++) {
                    createPhoto(result, $resultsContents, i);
                    createHistory(result.predictions[i], $history);
                }

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

function createHistory(pred_result, $history) {
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

    history.push(pred_result);

    let $row = $("<div></div>");
    $row.data("prediction_id", pred_result.prediction_id);
    $row.addClass("row");

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

    $history.prepend($row);

}

function createPhoto(result, $resultsContents, rowNumber) {
    // Person in results on bottom
    // <figure class="person">
    //     <img />
    //     <figcaption class="caption">
    //         David McCormick
    //     </figcaption>
    //     <img src="../images/verified.png" />
    // </figure>

    pred_name = result.predictions[rowNumber].pred_name;
    let $figure = $("<figure></figure>");
    $figure.addClass("person");

    let $image = $("<img />");
    $image.prop("src", m_dataURI + result.predictions[rowNumber].image);

    let $figCaption = $("<figcaption></figcaption>");
    $figCaption.addClass("caption");
    $figCaption.text(pred_name);

    let $icon = $("<img />")
    $icon.addClass("icon");
    setPredictionIcon(result.predictions[rowNumber].info, pred_name, $icon);
    
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
    console.log(distance);

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