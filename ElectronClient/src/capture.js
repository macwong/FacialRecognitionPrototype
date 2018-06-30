import React from 'react';
import ReactDOM from 'react-dom';
import Viewer from './react/viewer';
import Globals from './globals';
import Helpers from './helpers';
import { ImageProcessor } from './imageprocessor';

const electron = require("electron");
const { remote } = electron;
const video = require("./video");
const fs = require("fs");
const $ = require("./jquery")
const { dialog } = electron.remote;
const path = require('path')

let m_imageProcessor = null;

function getModels($select) {
    var deferred = $.Deferred();

    $.ajax({
        url: path.join(Globals.endpoint, "getmodels"),
        type: "GET",
        dataType:"json"
    }).done((result) => {
        $select.empty();

        for (var i = 0; i < result.models.length; i++) {
            let $option = $("<option></option>");
            $option.text(result.models[i]);
            $option.val(result.models[i]);
            $select.append($option);
        }

        deferred.resolve();
    });

    return deferred.promise();
}

function initApp(callback) {
    let $models = $(document).find(".models");
    let $select = $("<select></select>");

    getModels($select).then(() => {
        $models.html($select);

        m_imageProcessor.currentModel = $select.find("option:first").val();

        $select.change((e) => {
            m_imageProcessor.currentModel = $select.val();
        })

        $('.add-model').on('click', (e) => {
            e.preventDefault();

            $.get(path.join(__dirname, 'modal.html'), (data) => {
                let $modal = $(data);
                let $name = $modal.find(".model-name");
                let $folderLocation = $modal.find(".folder-location");
                let $algorithm = $modal.find(".algorithm");
                let $loading = $modal.find(".loading");

                $(document.body).append($modal);

                setTimeout(() => {
                    $modal.addClass('is-visible');
                }, 50);

                $modal.find(".modal-toggle").click((e) => {
                    $modal.removeClass('is-visible');
                    
                    $modal.on('transitionend', (e) => {
                        //when transition is finished you remove the element.
                        $modal.remove();
                    });
                });

                $modal.find(".choose-folder").click((e) => {
                    dialog.showOpenDialog(
                        remote.getCurrentWindow(), {
                            properties: ['openDirectory']
                        },
                        function (filePaths) {
                            $folderLocation.val(filePaths[0]);
                        }
                    );
                });

                $modal.find(".model-add").click((e) => {
                    $loading.addClass("is-visible");

                    $.ajax({
                        url: path.join(Globals.endpoint, "train"),
                        type: "POST",
                        data: JSON.stringify({
                            input_folder_path: $folderLocation.val(),
                            model_folder_name: $name.val(),
                            model_type: $algorithm.val()
                        }),
                        contentType: "application/json; charset=utf-8",
                        dataType:"json",
                        
                    }).done((result) => {
                        $loading.removeClass("is-visible");
                        $modal.removeClass('is-visible');
                    
                        $modal.on('transitionend', (e) => {
                            //when transition is finished you remove the element.
                            $modal.remove();
                        });

                        getModels($select).then(() => {
                            $select.val(m_imageProcessor.currentModel);
                        });
                    }).fail((jqXHR, textStatus, errorThrown) => {
                        $loading.removeClass("is-visible");
                        let $errorMsg = $modal.find(".error-message");
                        $errorMsg.text(jqXHR.responseJSON.error);
                    });
                });
            });
        });

        callback();
    });
}

function getVideoStream(videoEl) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoEl.src = URL.createObjectURL(stream);

        videoEl.onloadedmetadata = (e) => {
            m_imageProcessor.captureImage();
        };
    }).catch(() =>  {
        alert('could not connect stream');
    });
}

$(document).ready(() => {
    ReactDOM.render(
        <Viewer />,
        document.getElementById("viewerContainer")
    );

    const videoEl = document.getElementById("video");
    const canvasEl = document.getElementById("canvas");
    const $resultsContainer = $(document).find(".resultsContainer");
    const $history = $(document).find(".history");
    const $info = $(document).find(".info");
    
    m_imageProcessor = new ImageProcessor(
        videoEl, 
        canvasEl, 
        $resultsContainer.find(".resultsOverlay"), 
        document.getElementById('info')
    );

    initApp(() => {
        $resultsContainer.find(".resultsContents").text("Loading...");
        getVideoStream(videoEl);
    });

    $(document).find(".input-checkbox").change((e) => {
        let $inputCheckbox = $(e.currentTarget);

        if ($inputCheckbox.is(":checked")) {
            $history.show();
            $info.show();
            m_imageProcessor.verbose = true;
        }
        else {
            $history.hide();
            $info.hide();
            m_imageProcessor.verbose = false;
        }
    });

    let $segment = $(".segmented label input[type=radio]");

    $segment.on("change", (e) => {
        let $option = $(e.currentTarget);
        let $parent = $option.parent();

        if($option.is(":checked")) {
            $parent.siblings().each((sigIndex, sibValue) => {
                $(sibValue).removeClass("checked");
            });

            $parent.addClass("checked");

            let $video = $(videoEl);
            $video.prop("controls", false);

            if ($parent.hasClass("option-live") || $parent.hasClass("option-video")) {
                $video.show();
                $(canvasEl).hide();
                m_imageProcessor.isVideo = true;

                if ($parent.hasClass("option-live")) {
                    getVideoStream(videoEl);
                }
                else {
                    $video.addClass("file");
                    $video.prop("src", "");
                    $video.removeAttr("src");
                }
            }
            else if ($parent.hasClass("option-image")) {
                if ($video.hasClass("file")) {
                    $video.removeClass("file");

                    canvasEl.width = Globals.defaultWidth;
                    canvasEl.height = Globals.defaultHeight;
                }
                
                $video.hide();
                $video.prop("src", "");
                $video.removeAttr("src");
                $(canvasEl).show();
                m_imageProcessor.isVideo = false;
            }
        }
    });

    $(videoEl).click((e) => {
        if ($(e.currentTarget).hasClass("file")) {
            openVideo(videoEl, canvasEl, $resultsContainer);
        }
    });

    $(canvasEl).click((e) => {
        openImage();
    });
});

function openVideo(videoEl, canvasEl, $resultsContainer) {
    dialog.showOpenDialog(
        remote.getCurrentWindow(),
        {
            defaultPath: 'c:/',
            filters: [
                { name: 'Images', extensions: ['avi', 'mov', 'mkv', 'mp4'] }
              ],
            properties: ['openFile']
        },
        function (filePaths) {
            $(videoEl).prop("controls", true);
            
            Helpers.fadeStuff($resultsContainer.find(".resultsOverlay"));
            m_imageProcessor.captureImage();

            videoEl.src = filePaths[0];
        }
    );    
}

function openImage() {
    dialog.showOpenDialog(
        remote.getCurrentWindow(),
        {
            defaultPath: 'c:/',
            filters: [
                { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
              ],
            properties: ['openFile', 'multiSelections']
        },
        function (filePaths) {
            m_imageProcessor.currentImages = filePaths;
            m_imageProcessor.updateImage();
        }
    );
}