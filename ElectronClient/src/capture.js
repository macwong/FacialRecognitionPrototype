const electron = require("electron");
const { remote } = electron;
const video = require("./video");
const $ = require("jquery");
const fs = require("fs");
const { dialog } = electron.remote;

let isVideo = true;
let defaultWidth;
let defaultHeight;
let currentModel;

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
                var dataURI = "data:image/png;base64,"

                $resultsContents.empty();

                for (var i = 0; i < arrayLength; i++) {
                    let $figure = $("<figure></figure>");
                    $figure.addClass("person");

                    let $image = $("<img />");
                    $image.prop("src", dataURI + result.predictions[i].image);

                    let $figCaption = $("<figcaption></figcaption>");
                    $figCaption.addClass("caption");
                    $figCaption.text(result.predictions[i].pred_name);

                    $figure.append($image);
                    $figure.append($figCaption);
                    $resultsContents.append($figure);
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