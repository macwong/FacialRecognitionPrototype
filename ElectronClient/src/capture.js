const video = require("./video")
const $ = require("jquery")

navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
    const videoEl = document.getElementById("video");
    const $resultsContents = $(document).find(".resultsContents");
    $resultsContents.text("Loading...")

    var cam = document.getElementById('video')
    cam.src = URL.createObjectURL(stream);

    cam.onloadedmetadata = function(e) {
        captureImage(videoEl, $resultsContents);

    };
}).catch(() =>  {
    alert('could not connect stream');
});

function captureImage(videoEl, $resultsContents) {
    var canvas = document.createElement("canvas");
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
        if(String.prototype.toLowerCase.call(result.success) === "true") {
            var arrayLength = result.predictions.length;

            if (arrayLength === 0) {
                $resultsContents.text("Dude! You're invisible!");
            }
            else {
                var displayString = "Hello "
                var dataURI = "data:image/png;base64,"

                $resultsContents.empty();

                for (var i = 0; i < arrayLength; i++) {
                    // if (i === 0) {
                    //     displayString += result.predictions[i].pred_name;
                    // }
                    // else if (i + 1 === arrayLength && i > 0) { 
                    //     displayString += " and " + result.predictions[i].pred_name;
                    // }
                    // else {
                    //     displayString += ", " + result.predictions[i].pred_name;
                    // }

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

                // $resultsContainer.text(displayString);
            }
        }
        else {
            $resultsContents.text(result.error);
        }

        // When one request is done, do it all over again...
        captureImage(videoEl, $resultsContents);
    }).fail((jqXHR, textStatus, errorThrown) => {
        $resultsContents.text(jqXHR.responseJSON.error);
        
        captureImage(videoEl, $resultsContents);
    });
}
