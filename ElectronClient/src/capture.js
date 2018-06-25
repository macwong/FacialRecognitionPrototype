import React from 'react';
import ReactDOM from 'react-dom';
import Predictions from './react/predictions';
import History from './react/history';
import Info from './react/info';
import Helpers from './helpers';

const electron = require("electron");
const { remote } = electron;
const video = require("./video");
const fs = require("fs");
const $ = require("./jquery")
const { dialog } = electron.remote;
const path = require('path')

const m_endpoint = "http://127.0.0.1:5000/daveface/"
const m_defaultWidth = 640;
const m_defaultHeight = 480;

let m_isVideo = true;
let m_currentWidth = m_defaultWidth;
let m_currentHeight = m_defaultHeight;
let m_currentModel;
let m_predictionHistory = {};
let m_currentImages = [];
let m_verbose = false;

let m_reactPredictions = null;
let m_reactHistory = null;
let m_reactInfo = null;

function getModels($select) {
    var deferred = $.Deferred();

    $.ajax({
        url: path.join(m_endpoint, "getmodels"),
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

        m_currentModel = $select.find("option:first").val();

        $select.change((e) => {
            m_currentModel = $select.val();
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
                        url: path.join(m_endpoint, "train"),
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
                            $select.val(m_currentModel);
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

function getVideoStream(videoEl, canvasEl, $resultsContainer) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        videoEl.src = URL.createObjectURL(stream);

        videoEl.onloadedmetadata = (e) => {
            captureImage(videoEl, canvasEl, $resultsContainer);

        };
    }).catch(() =>  {
        alert('could not connect stream');
    });
}

$(document).ready(() => {
    const videoEl = document.getElementById("video");
    const canvasEl = document.getElementById("canvas");
    const $resultsContainer = $(document).find(".resultsContainer");
    const $history = $(document).find(".history");
    const $info = $(document).find(".info");
    

    initApp(() => {
        $resultsContainer.find(".resultsContents").text("Loading...");
        getVideoStream(videoEl, canvasEl, $resultsContainer);
    });

    $(document).find(".input-checkbox").change((e) => {
        let $inputCheckbox = $(e.currentTarget);

        if ($inputCheckbox.is(":checked")) {
            $history.show();
            $info.show();
            m_verbose = true;
        }
        else {
            $history.hide();
            $info.hide();
            m_verbose = false;
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
                m_isVideo = true;

                if ($parent.hasClass("option-live")) {
                    getVideoStream(videoEl, canvasEl, $resultsContainer);
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

                    canvasEl.width = m_defaultWidth;
                    canvasEl.height = m_defaultHeight;
                    m_currentWidth = m_defaultWidth;
                    m_currentHeight = m_defaultHeight;
                }
                
                $video.hide();
                $video.prop("src", "");
                $video.removeAttr("src");
                $(canvasEl).show();
                m_isVideo = false;
            }
        }
    });

    $(videoEl).click((e) => {
        if ($(e.currentTarget).hasClass("file")) {
            openVideo(videoEl, canvasEl, $resultsContainer);
        }
    });

    $(canvasEl).click((e) => {
        openImage(videoEl, canvasEl, $resultsContainer);
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
            
            fadeStuff($resultsContainer.find(".resultsOverlay"));
            captureImage(videoEl, canvasEl, $resultsContainer);

            videoEl.src = filePaths[0];
        }
    );    
}

function openImage(videoEl, canvasEl, $resultsContainer) {
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
            m_currentImages = filePaths;
            updateImage(canvasEl, videoEl, $resultsContainer);
        }
    );
}

function updateImage(canvasEl, videoEl, $resultsContainer) {
    var ctx = canvasEl.getContext('2d');
    var img = new Image();
    img.onload = function() {
        var canvasLeft = 0;
        var canvasTop = 0;
        var imageWidth = img.width;
        var imageHeight = img.height;

        var ratio = 0;

        // Check if the current width is larger than the max
        if(imageWidth > m_defaultWidth){
            ratio = m_defaultWidth / imageWidth;   // get ratio for scaling image
            $(this).css("width", m_defaultWidth); // Set new width
            $(this).css("height", imageHeight * ratio);  // Scale height based on ratio
            imageHeight = imageHeight * ratio;    // Reset height to match scaled image
            imageWidth = imageWidth * ratio;    // Reset width to match scaled image
        }
        
        // Check if current height is larger than max
        if(imageHeight > m_defaultHeight){
            ratio = m_defaultHeight / imageHeight; // get ratio for scaling image
            $(this).css("height", m_defaultHeight);   // Set new height
            $(this).css("width", imageWidth * ratio);    // Scale width based on ratio
            imageWidth = imageWidth * ratio;    // Reset width to match scaled image
            imageHeight = imageHeight * ratio;    // Reset height to match scaled image
        }
        
        canvasLeft = (m_defaultWidth - imageWidth) / 2;
        canvasTop = (m_defaultHeight - imageHeight) / 2;
        
        let opacity = 0;
        
        (function fadeIn() {
            ctx.clearRect(0, 0, m_defaultWidth, m_defaultHeight);
            ctx.globalAlpha = opacity;
            ctx.drawImage(img, canvasLeft, canvasTop, imageWidth, imageHeight);
            opacity += 0.015;
            if (opacity < 1) {
                requestAnimationFrame(fadeIn);
            }
        })();

        // ctx.drawImage(img, canvasLeft, canvasTop, imageWidth, imageHeight);
        fadeStuff($resultsContainer.find(".resultsOverlay"));
        captureImage(videoEl, canvasEl, $resultsContainer);
    }

    if (m_currentImages !== null && m_currentImages !== undefined) {
        img.src = m_currentImages[0];
        $(canvasEl).data("file_source", m_currentImages[0]);
    }
}

function captureImage(videoEl, canvasEl, $resultsContainer) {
    var $resultsOverlay = $resultsContainer.find(".resultsOverlay");
    var $info = $(document).find(".info");

    m_currentWidth = videoEl.videoWidth;

    if (m_currentWidth === 0) {
        m_currentWidth = m_defaultWidth;
    }

    m_currentHeight = videoEl.videoHeight;

    if (m_currentHeight === 0) {
        m_currentHeight = m_defaultHeight;
    }

    var dataURL = $(canvasEl).data("file_source");

    if (m_isVideo) {
        if (videoEl.src === "") {
            console.log(videoEl.src);
            return;
        }

        canvasEl.width = m_currentWidth;
        canvasEl.height = m_currentHeight;
        canvasEl.getContext('2d').drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
        var dataURL = canvasEl.toDataURL('image/jpeg', 1.0);
    }

    $.ajax({
        url: path.join(m_endpoint, "predict"),
        type: "POST",
        data: JSON.stringify({
            image: dataURL,
            model: m_currentModel,
            verbose: m_verbose
        }),
        contentType: "application/json; charset=utf-8",
        dataType:"json",
        
    }).done((result) => {
        clearOverlay($resultsOverlay);
        let success = String.prototype.toLowerCase.call(result.success) === "true";
        createPredictions(result.predictions, success, result.error);

        if (m_verbose) {
            createHistory(result, $info);
        }
        
        if (m_isVideo && videoEl.src !== "") {
            fadeStuff($resultsOverlay);
        }

        if (m_isVideo) {
            // When one request is done, do it all over again...
            captureImage(videoEl, canvasEl, $resultsContainer);
        }
        else {
            if (m_currentImages !== null && m_currentImages !== undefined && m_currentImages.length > 0) {
                m_currentImages.shift();
            }

            if (m_currentImages !== null && m_currentImages !== undefined && m_currentImages.length > 0) {
                sleep(2000).then(() => {
                    updateImage(canvasEl, videoEl, $resultsContainer)
                });
            }
        }
    }).fail((jqXHR, textStatus, errorThrown) => {
        clearOverlay($resultsOverlay);
        createPredictions(null, false, jqXHR.responseJSON.error);

        if (m_isVideo) {
            captureImage(videoEl, canvasEl, $resultsContainer);
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function fadeStuff($resultsOverlay) {
    $resultsOverlay.fadeTo(7500, 1.0);
}

function clearOverlay($resultsOverlay) {
    $resultsOverlay.stop(true).css('opacity', '0.0');
}

function createPredictions(predictions, success, error) {
    if (m_reactPredictions === null) {
        m_reactPredictions = ReactDOM.render(
            <Predictions 
                predictions={predictions}
                success={success}
                error={error}
            />,
            document.getElementById("resultsContents")
        );
    }
    else {
        m_reactPredictions.updatePredictions(predictions, success, error);
    }
}

function createHistory(prediction, $info) {
    if (m_reactHistory === null) {
        m_reactHistory = ReactDOM.render(
            <History 
                predictions={prediction.predictions}
                $info={$info}
                infoCallback={createInfo}
            />,
            document.getElementById("history")
        );
    }
    else {
        m_reactHistory.updateHistory(prediction.predictions);
    }

    // Store in a dictionary
    for (var pred in prediction.predictions) {
        const predValues = prediction.predictions[pred];
        m_predictionHistory[predValues.prediction_id] = predValues;
    }
}

function createInfo(predictionID) {
    if (m_reactInfo === null) {
        m_reactInfo = ReactDOM.render(
            <Info
                prediction={m_predictionHistory[predictionID]}
            />,
            document.getElementById("info")
        );
    }
    else {
        m_reactInfo.updateInfo(m_predictionHistory[predictionID]);
    }
    // $info.empty();
    
    // $.get(path.join(__dirname, 'info.html'), (data) => {
    //     let predictionID = $row.data("prediction_id");
    //     let result = m_predictionHistory[predictionID];

    //     if (result === undefined) {
    //         return;
    //     }
        
    //     let pred_name = result.pred_name;
    //     let $contents = $("<div></div>").html(data);
    //     let $figure = $contents.find("figure");
        
    //     $figure.find(".profile-pic").prop("src", Helpers.pngSource + result.image);
    //     $figure.find(".caption h2").text(pred_name);
    //     setPredictionIcon(result.pred_info, pred_name, $figure.find(".icon"));
        
    //     let $scores = $contents.find(".scores");
    //     $scores.find(".probability").text(getProbability(result.probability));
    //     $scores.find(".distance").text(result.distance.toFixed(2));

    //     getExpandableBlock($contents, ".model-info", ($block, $details) => {
    //         let $modelName = $details.find(".model-name");
    //         let $totalPeople = $details.find(".total-people");
    //         let $trainingImages = $details.find(".training-images");
    //         let $algorithm = $details.find(".algorithm");
    //         let $peopleList = $details.find(".people-list");
    //         let $li = $peopleList.find("li").clone();

    //         let model_info = result.model_info;

    //         $modelName.text(model_info.model_name);
    //         $totalPeople.text(model_info.total_people);
    //         $trainingImages.text(model_info.training_images);
    //         $algorithm.text(model_info.algorithm);
            
    //         $peopleList.empty();

    //         for (var class_index in model_info.class_names) {
    //             let class_name = model_info.class_names[class_index];

    //             $li.text(class_name);
    //             $peopleList.append($li.clone());
    //         }
    //     });

    //     getExpandableBlock($contents, ".embeddings", ($block, $details) => {
    //         let $span = $details.find(".emb").clone();

    //         $details.empty();

    //         for (var emb_index in result.embeddings) {
    //             let emb = result.embeddings[emb_index];
    //             emb = emb.toFixed(5);
    //             let embDisplay = emb.toString();

    //             if (emb > 0) {
    //                 embDisplay = " " + embDisplay;
    //             }

    //             $span.text(embDisplay);
    //             $details.append($span.clone());
    //         }
    //     });        

    //     getExpandableBlock($contents, ".top-predictions", ($block, $details) => {
    //         $.get(path.join(__dirname, 'toppredictionsrow.html'), (rowData) => {
    //             let $rowTemplate = $(rowData);
    //             let $rowName = $rowTemplate.find(".top-name");
    //             let $rowRating = $rowTemplate.find(".rating");
    //             let $ratingImage = $rowRating.find("img:first");
    //             let $training = $rowTemplate.find(".training-images");
    //             let $trainingImage = $training.find("img:first");
    //             let $rowScores = $rowTemplate.find(".top-scores");
    
    //             for (var infoIndex in result.pred_info) {
    //                 let info = result.pred_info[infoIndex];
    //                 let rank = Number(infoIndex) + 1;
    //                 $rowName.find(".top-name-heading").text(rank + ". " + info.name);
    
    //                 let rating = Helpers.getRating(info.distance);
    //                 $rowRating.empty();
    //                 setPredictionImage($ratingImage, info.distance);
    
    //                 for (var i = 0; i < rating; i++) {
    //                     $rowRating.append($ratingImage.clone());
    //                 }
    
    //                 $training.empty();
    
    //                 for (var i = 0; i < info.photo_path.length; i++) {
    //                     let photo_path = info.photo_path[i];
    //                     $trainingImage.prop("src", photo_path);
    //                     $training.append($trainingImage.clone());
    //                 }
    
    //                 $rowScores.find(".probability").text(getProbability(info.probability));
    //                 $rowScores.find(".distance").text(info.distance.toFixed(2));
    
    //                 $details.append($rowTemplate.clone());
    //             }
    //         });
    //     });

    //     getExpandableBlock($contents, ".add-face", ($block, $details) => {
    //         let $editableDropdown = $details.find(".editable-dropdown");
    //         let $input = $editableDropdown.find(".input");
    //         let $dataList = $details.find(".data-list");
    //         let $addButton = $details.find(".add-new-face");
    //         let $addInfo = $details.find(".add-info");
    //         let $nameOption = $dataList.find("option").clone();

    //         $dataList.empty();

    //         for (var nameIndex in result.model_info.class_names) {
    //             let name = result.model_info.class_names[nameIndex];
                
    //             $nameOption.text(name);
    //             $nameOption.val(name);

    //             if (name === pred_name) {
    //                 $input.val(name);
    //             }

    //             $dataList.append($nameOption.clone());
    //         }

    //         $addButton.click((e) => {
    //             let $button = $(e.currentTarget); 

    //             if (!$button.hasClass("disabled")) {
    //                 $.ajax({
    //                     url: path.join(m_endpoint, "addface"),
    //                     type: "POST",
    //                     data: JSON.stringify({
    //                         image: result.image,
    //                         model: m_currentModel,
    //                         name: $input.val()
    //                     }),
    //                     contentType: "application/json; charset=utf-8",
    //                     dataType:"json"
    //                 }).done((result) => {
    //                     $addInfo.text("New face added!");
    //                 });

    //                 $button.addClass("disabled");
    //             }
    //         });
    //     });

    //     $info.html($contents.children());
    // });
}

function getExpandableBlock($contents, blockClass, callback) {
    let $block = $contents.find(".block" + blockClass);
    let $details = $block.find(".block-details");
    let $expandable = $block.find(".expandable");
    $details.hide();
    
    $expandable.click((e) => {
        if ($block.hasClass("collapsed")) {
            $block.removeClass("collapsed");
            $details.slideDown();
        }
        else {
            $block.addClass("collapsed");
            $details.slideUp();
        }
    });

    callback($block, $details);
}

function getProbability(probability) {
    let prob = probability * 100;
    prob = prob.toFixed(2);
    return prob + "%";
}

function setPredictionIcon(info, pred_name, $icon) {
    let individual = Helpers.getIndividualPredictionInfo(info, pred_name);

    if (individual !== null) {
        setPredictionImage($icon, individual.distance);
    }

    return individual;
}

function setPredictionImage($icon, distance) {
    if (distance < 0.75) {
        $icon.prop("src", "../images/verified.png");
    }
    else if (distance < 0.9) {
        $icon.prop("src", "../images/like.png");
    }
    else if (distance < 1.05) {
        $icon.prop("src", "../images/maybe.png");
    }
    else if (distance < 1.2) {
        $icon.prop("src", "../images/noidea.png");
    }
    else {
        $icon.prop("src", "../images/rotten.png");
    }
}