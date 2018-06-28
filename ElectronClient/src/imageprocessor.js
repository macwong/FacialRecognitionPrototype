// import Globals from './globals';
// import $ from 'jquery';

// export default class ImageProcessor {
//     constructor(videoEl, canvasEl, $resultsContainer, isVideo, currentModel, verbose, currentImages, $info) {
//         this.videoEl = videoEl;
//         this.canvasEl = canvasEl;
//         this.$resultsContainer = $resultsContainer;
//         this.isVideo = isVideo;
//         this.currentModel = currentModel;
//         this.verbose = verbose;
//         this.currentImages = currentImages;
//         this.$info = $info;
//     }

//     captureImage() {
//         var $resultsOverlay = this.$resultsContainer.find(".resultsOverlay");
    
//         let currentWidth = this.videoEl.videoWidth;
    
//         if (currentWidth === 0) {
//             currentWidth = Globals.defaultWidth;
//         }
    
//         let currentHeight = this.videoEl.videoHeight;
    
//         if (currentHeight === 0) {
//             currentHeight = Globals.defaultHeight;
//         }
    
//         var dataURL = $(this.canvasEl).data("file_source");
    
//         if (this.isVideo) {
//             if (this.videoEl.src === "") {
//                 console.log(this.videoEl.src);
//                 return;
//             }
    
//             this.canvasEl.width = currentWidth;
//             this.canvasEl.height = currentHeight;
//             this.canvasEl.getContext('2d').drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height);
//             var dataURL = this.canvasEl.toDataURL('image/jpeg', 1.0);
//         }
    
//         $.ajax({
//             url: path.join(Globals.endpoint, "predict"),
//             type: "POST",
//             data: JSON.stringify({
//                 image: dataURL,
//                 model: this.currentModel,
//                 verbose: this.verbose
//             }),
//             contentType: "application/json; charset=utf-8",
//             dataType:"json",
            
//         }).done((result) => {
//             Helpers.clearOverlay($resultsOverlay);
//             let success = String.prototype.toLowerCase.call(result.success) === "true";
//             createPredictions(result.predictions, success, result.error);
    
//             if (this.verbose) {
//                 createHistory(result, this.$info);
//             }
            
//             if (this.isVideo && this.videoEl.src !== "") {
//                 fadeStuff($resultsOverlay);
//             }
    
//             if (this.isVideo) {
//                 // When one request is done, do it all over again...
//                 captureImage(this.videoEl, this.canvasEl, this.$resultsContainer);
//             }
//             else {
//                 if (this.currentImages !== null && this.currentImages !== undefined && this.currentImages.length > 0) {
//                     this.currentImages.shift();
                    
//                     sleep(2000).then(() => {
//                         updateImage(this.canvasEl, this.videoEl, this.$resultsContainer)
//                     });
//                 }
//             }
//         }).fail((jqXHR, textStatus, errorThrown) => {
//             clearOverlay($resultsOverlay);
//             createPredictions(null, false, jqXHR.responseJSON.error);
    
//             if (this.isVideo) {
//                 captureImage(this.videoEl, this.canvasEl, this.$resultsContainer);
//             }
//         });
//     }
// }