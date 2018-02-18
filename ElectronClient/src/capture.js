navigator.mediaDevices.getUserMedia({video: true})
    .then((stream) => {
    var cam = document.getElementById('camera')
    cam.src = URL.createObjectURL(stream);
    cam.onloadedmetadata = (e) => {
        cam.play();
    };
}).catch(() =>  {
    alert('could not connect stream');
});