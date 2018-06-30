import React from 'react';
import ReactDOM from 'react-dom';
import Viewer from './react/viewer';

const video = require("./video");
const fs = require("fs");
const $ = require("./jquery")


$(document).ready(() => {
    ReactDOM.render(
        <Viewer />,
        document.getElementById("viewerContainer")
    );

    // const videoEl = document.getElementById("video");
    // const canvasEl = document.getElementById("canvas");
    // const $resultsContainer = $(document).find(".resultsContainer");
    // const $history = $(document).find(".history");
    // const $info = $(document).find(".info");
    
    // m_imageProcessor = new ImageProcessor(
    //     videoEl, 
    //     canvasEl, 
    //     $resultsContainer.find(".resultsOverlay"), 
    //     document.getElementById('info')
    // );

    // initApp(() => {
    //     $resultsContainer.find(".resultsContents").text("Loading...");
    //     getVideoStream(videoEl);
    // });

    // $(document).find(".input-checkbox").change((e) => {
    //     let $inputCheckbox = $(e.currentTarget);

    //     if ($inputCheckbox.is(":checked")) {
    //         $history.show();
    //         $info.show();
    //         m_imageProcessor.verbose = true;
    //     }
    //     else {
    //         $history.hide();
    //         $info.hide();
    //         m_imageProcessor.verbose = false;
    //     }
    // });

    // let $segment = $(".segmented label input[type=radio]");

    // $segment.on("change", (e) => {
    //     let $option = $(e.currentTarget);
    //     let $parent = $option.parent();

    //     if($option.is(":checked")) {
    //         $parent.siblings().each((sigIndex, sibValue) => {
    //             $(sibValue).removeClass("checked");
    //         });

    //         $parent.addClass("checked");

    //         let $video = $(videoEl);
    //         $video.prop("controls", false);

    //         if ($parent.hasClass("option-live") || $parent.hasClass("option-video")) {
    //             $video.show();
    //             $(canvasEl).hide();
    //             m_imageProcessor.isVideo = true;

    //             if ($parent.hasClass("option-live")) {
    //                 getVideoStream(videoEl);
    //             }
    //             else {
    //                 $video.addClass("file");
    //                 $video.prop("src", "");
    //                 $video.removeAttr("src");
    //             }
    //         }
    //         else if ($parent.hasClass("option-image")) {
    //             if ($video.hasClass("file")) {
    //                 $video.removeClass("file");

    //                 canvasEl.width = Globals.defaultWidth;
    //                 canvasEl.height = Globals.defaultHeight;
    //             }
                
    //             $video.hide();
    //             $video.prop("src", "");
    //             $video.removeAttr("src");
    //             $(canvasEl).show();
    //             m_imageProcessor.isVideo = false;
    //         }
    //     }
    // });

    // $(videoEl).click((e) => {
    //     if ($(e.currentTarget).hasClass("file")) {
    //         openVideo(videoEl, canvasEl, $resultsContainer);
    //     }
    // });

    // $(canvasEl).click((e) => {
    //     openImage();
    // });
});

