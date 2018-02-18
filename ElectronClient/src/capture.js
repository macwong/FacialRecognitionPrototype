const video = require("./video")

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

    recordEl.addEventListener("click", () => {
        video.captureBytes(ctx, videoEl, canvasEl);
    });
});