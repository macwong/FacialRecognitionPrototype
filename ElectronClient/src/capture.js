const video = require("./video")
const $ = require("jquery")

$(document).ready(() => {
    navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
        const videoEl = document.getElementById("video");
        const $resultsContainer = $(document).find(".resultsContainer");
        $resultsContainer.find(".resultsContents").text("Loading...")

        var cam = document.getElementById('video')
        cam.src = URL.createObjectURL(stream);

        cam.onloadedmetadata = function(e) {
            // captureImage(videoEl, $resultsContainer);

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
            }
        });
    });
});

function captureImage(videoEl, $resultsContainer) {
    var $resultsContents = $resultsContainer.find(".resultsContents");
    var $resultsOverlay = $resultsContainer.find(".resultsOverlay");
    var canvas = $(".videoContainer").find("canvas")[0];
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    var dataURL = canvas.toDataURL('image/jpeg', 1.0);
    $.ajax({
        url: "http://localhost:5000/daveface/predict",
        type: "POST",
        data: JSON.stringify({
            image: dataURL
        }),
        contentType: "application/json; charset=utf-8",
        dataType:"json",
        
    }).done((result) => {
        $resultsOverlay.stop(true).css('opacity', '0.0');

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

                fadeStuff($resultsOverlay);
            }
        }
        else {
            $resultsContents.text(result.error);
        }


        // When one request is done, do it all over again...
        captureImage(videoEl, $resultsContainer);
    }).fail((jqXHR, textStatus, errorThrown) => {
        $resultsOverlay.stop(true).css('opacity', '0.0');
        
        $resultsContents.text(jqXHR.responseJSON.error);
        
        captureImage(videoEl, $resultsContainer);
    });
}

function fadeStuff($resultsOverlay) {
    $resultsOverlay.fadeTo(7500, 1.0);
}