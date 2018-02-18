const video = require("./video")
const $ = require("jquery")

navigator.mediaDevices.getUserMedia({video: true}).then((stream) => {
    var cam = document.getElementById('video')
    cam.src = URL.createObjectURL(stream);
}).catch(() =>  {
    alert('could not connect stream');
});

window.addEventListener("DOMContentLoaded", () => {
    const videoEl = document.getElementById("video");
    const canvasEl = document.getElementById("canvas");
    const ctx = canvasEl.getContext("2d");

    $(videoEl).click((e) => {
        captureImage(videoEl);
    });
    // canvasEl.addEventListener("click", () => {
    //     console.log("test")
    //     video.captureBytes(ctx, videoEl, canvasEl);
    // });
});

function captureImage(videoEl) {
    var canvas = document.createElement("canvas");
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    canvas.getContext('2d')
          .drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    var img = document.createElement("img");
    img.src = canvas.toDataURL();
    $("body").append(img);
}
