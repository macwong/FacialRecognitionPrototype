import React, {Component} from 'react';
import Viewer from './viewer';
import { ImageProcessor } from '../imageprocessor';
import Globals from '../globals';
import Helpers from '../helpers';
import electron from 'electron';
import {remote} from 'electron';
import $ from 'jquery';

const { dialog } = electron.remote;
const path = require('path')

export default class App extends Component {
    constructor(props) {
        super(props);

        this.imageProcessor = null;
        this.videoEl = null;
        this.canvasEl = null;
        this.$resultsContainer = null;
        this.$history = null;
        this.$info = null;
    }

    render() {
        return (
            <div className="container">
                <div className="videoContainer">
                    <div className="column column-one">
                        <div id="history" className="history">
                        </div>
                    </div>
                    <div className="column column-two">
                        <Viewer />
                    </div>
                    <div className="column column-three">
                        <div id="info">
                        </div>
                    </div>
                </div>
                <div id="resultsContainer" className="resultsContainer">
                    <div id="resultsContents" className="resultsContents"></div>
                    <div id="resultsOverlay" className="resultsOverlay"></div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.videoEl = document.getElementById("video");
        this.canvasEl = document.getElementById("canvas");
        this.$resultsContainer = $(document.getElementById("resultsContainer"));
        this.$history = $(document.getElementById("history"));
        this.$info = $(document.getElementById("info"));

        this.imageProcessor = new ImageProcessor(
            this.videoEl, 
            this.canvasEl, 
            this.$resultsContainer.find(".resultsOverlay"), 
            this.$info
        );

        this.initApp(() => {
            this.$resultsContainer.find(".resultsContents").text("Loading...");
            this.getVideoStream();
        });
    
        $(document).find(".input-checkbox").change((e) => {
            let $inputCheckbox = $(e.currentTarget);
    
            if ($inputCheckbox.is(":checked")) {
                this.$history.show();
                this.$info.show();
                this.imageProcessor.verbose = true;
            }
            else {
                this.$history.hide();
                this.$info.hide();
                this.imageProcessor.verbose = false;
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
    
                let $video = $(this.videoEl);
                $video.prop("controls", false);
    
                if ($parent.hasClass("option-live") || $parent.hasClass("option-video")) {
                    $video.show();
                    $(this.canvasEl).hide();
                    this.imageProcessor.isVideo = true;
    
                    if ($parent.hasClass("option-live")) {
                        this.getVideoStream();
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
    
                        this.canvasEl.width = Globals.defaultWidth;
                        this.canvasEl.height = Globals.defaultHeight;
                    }
                    
                    $video.hide();
                    $video.prop("src", "");
                    $video.removeAttr("src");
                    $(this.canvasEl).show();
                    this.imageProcessor.isVideo = false;
                }
            }
        });
    
        $(this.videoEl).click((e) => {
            if ($(e.currentTarget).hasClass("file")) {
                this.openVideo();
            }
        });
    
        $(this.canvasEl).click((e) => {
            this.openImage();
        });
    }

    initApp(callback) {
        let $models = $(document).find(".models");
        let $select = $("<select></select>");
    
        this.getModels($select).then(() => {
            $models.html($select);
    
            this.imageProcessor.currentModel = $select.find("option:first").val();
    
            $select.change((e) => {
                this.imageProcessor.currentModel = $select.val();
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
                            (filePaths) => {
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
    
                            this.getModels($select).then(() => {
                                $select.val(this.imageProcessor.currentModel);
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
    
    getVideoStream() {
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
            this.videoEl.src = URL.createObjectURL(stream);
    
            this.videoEl.onloadedmetadata = (e) => {
                this.imageProcessor.captureImage();
            };
        }).catch(() =>  {
            alert('could not connect stream');
        });
    }
    
    getModels($select) {
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

    openVideo() {
        dialog.showOpenDialog(
            remote.getCurrentWindow(),
            {
                defaultPath: 'c:/',
                filters: [
                    { name: 'Images', extensions: ['avi', 'mov', 'mkv', 'mp4'] }
                  ],
                properties: ['openFile']
            },
            (filePaths) => {
                $(this.videoEl).prop("controls", true);
                
                Helpers.fadeStuff(this.$resultsContainer.find(".resultsOverlay"));
                this.imageProcessor.captureImage();
    
                this.videoEl.src = filePaths[0];
            }
        );    
    }
    
    openImage() {
        dialog.showOpenDialog(
            remote.getCurrentWindow(),
            {
                defaultPath: 'c:/',
                filters: [
                    { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
                  ],
                properties: ['openFile', 'multiSelections']
            },
            (filePaths) => {
                this.imageProcessor.currentImages = filePaths;
                this.imageProcessor.updateImage();
            }
        );
    }   
}