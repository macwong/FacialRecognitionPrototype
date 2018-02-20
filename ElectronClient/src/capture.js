const video = require("./video")
const $ = require("jquery")

navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
    const videoEl = document.getElementById("video");
    const $resultsContainer = $(document).find(".resultsContainer");
    $resultsContainer.text("Loading...")

    var cam = document.getElementById('video')
    cam.src = URL.createObjectURL(stream);

    cam.onloadedmetadata = function(e) {
        captureImage(videoEl, $resultsContainer);

    };
}).catch(() =>  {
    alert('could not connect stream');
});

function captureImage(videoEl, $resultsContainer) {
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
                $resultsContainer.text("Dude! You're invisible!");
            }
            else {
                var displayString = "Hello "
                // console.log(result.predictions)
                
                for (var i = 0; i < arrayLength; i++) {
                    //Do something
                    if (i === 0) {
                        displayString += result.predictions[i].pred_name;
                    }
                    else if (i + 1 === arrayLength && i > 0) {
                        displayString += " and " + result.predictions[i].pred_name;
                    }
                    else {
                        displayString += ", " + result.predictions[i].pred_name;
                    }
                }

                $resultsContainer.text(displayString);
            }
        }
        else {
            $resultsContainer.text(result.error);
        }

        // When one request is done, do it all over again...
        captureImage(videoEl, $resultsContainer);
    }).fail((jqXHR, textStatus, errorThrown) => {
        $resultsContainer.text(jqXHR.responseJSON.error);
        
        captureImage(videoEl, $resultsContainer);
    });
}
