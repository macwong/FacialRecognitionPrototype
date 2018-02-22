const electron = require("electron");
const { remote } = electron;
const video = require("./video");
const $ = require("jquery");
const fs = require("fs");
const { dialog } = electron.remote;

let isVideo = true;

$(document).ready(() => {
    const videoEl = document.getElementById("video");
    const canvasEl = document.getElementById("canvas");
    const $resultsContainer = $(document).find(".resultsContainer");

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
                    ctx.drawImage(img, 0, 0);
                    captureImage(videoEl, canvasEl, $resultsContainer);
                }

                img.src = filePaths[0];
            }
        );
    });
});

function captureImage(videoEl, canvasEl, $resultsContainer) {
    var $resultsContents = $resultsContainer.find(".resultsContents");
    var $resultsOverlay = $resultsContainer.find(".resultsOverlay");
    var defaultWidth = videoEl.videoWidth;
    var defaultHeight = videoEl.videoHeight;

    if (isVideo) {
        canvasEl.width = defaultWidth;
        canvasEl.height = defaultHeight;
        canvasEl.getContext('2d').drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    }
    else {
        console.log(canvasEl.width);
        console.log(canvasEl.height);
        // canvasEl.getContext('2d').drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
    }

    var dataURL = canvasEl.toDataURL('image/jpeg', 1.0);
    $.ajax({
        url: "http://localhost:5000/daveface/predict",
        type: "POST",
        data: JSON.stringify({
            image: dataURL
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