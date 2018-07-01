import React, {Component} from 'react';
import Globals from '../js/globals';
import Helpers from '../js/helpers';
import electron from 'electron';
import {remote} from 'electron';
import $ from 'jquery';
import path from 'path';
const { dialog } = electron.remote;

export default class AddModel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: false,
            currentModel: ""
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.show !== prevProps.show) {
            this.setState({
                show: this.props.show,
                currentModel: this.props.currentModel
            });
        }
    }

    render() {
        return (
            <div className={this.getCSS(this.state.show)} id="addModel">
                <div className="modal-overlay modal-toggle"></div>
                <div className="modal-wrapper modal-transition">
                    <div className="modal-header">
                        <div className="modal-close modal-toggle">
                            <svg className="icon-close modal-icon" viewBox="0 0 32 32">
                                <use xlinkHref="#icon-close"></use>
                            </svg>
                        </div>
                        <h2 className="modal-heading">Add Model</h2>
                    </div>
                    
                    <div className="modal-body">
                        <div className="modal-content">
                            <ul className="fields">
                                <li>
                                    <label>Model Name:</label><input className="model-name" />
                                </li>
                                <li>
                                    <label>Image Folder:</label><input className="folder-location" /><button className="choose-folder">Choose</button>
                                </li>
                                <li>
                                    <label>Algorithm:</label>
                                    <select className="algorithm">
                                        <option>knn</option>
                                        <option>svc</option>
                                    </select>
                                </li>
                            </ul>
                            <button className="model-add">Add</button>
                            <span className="error-message"></span>
                        </div>
                    </div>
                </div>
                <div className="loading">
                    <div className="loading-overlay"></div>
                    <svg className="loading-icon" version="1.1" id="L6" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                    viewBox="0 0 100 100" enableBackground="new 0 0 100 100" xmlSpace="preserve">
                        <rect fill="none" stroke="#fff" strokeWidth="4" x="25" y="25" width="50" height="50">
                            <animateTransform
                                attributeName="transform"
                                dur="0.5s"
                                from="0 50 50"
                                to="180 50 50"
                                type="rotate"
                                id="strokeBox"
                                attributeType="XML"
                                begin="rectBox.end"/>
                        </rect>
                        <rect x="27" y="27" fill="#fff" width="46" height="50">
                            <animate
                                attributeName="height"
                                dur="1.3s"
                                attributeType="XML"
                                from="50" 
                                to="0"
                                id="rectBox" 
                                fill="freeze"
                                begin="0s;strokeBox.end"/>
                        </rect>
                    </svg>
                    <div className="loading-message">Training...</div>
                </div>
            </div>
        );
    }

    getCSS(show) {
        let containerCSS = "modal";

        if (show) {
            containerCSS += " is-visible";
        }

        return containerCSS;

    }

    componentDidMount() {
        let $modal = $("#addModel");
        let $folderLocation = $modal.find(".folder-location");

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

        $modal.find(".modal-toggle").click((e) => {
            this.props.cancelCallback();
        });

        $modal.find(".model-add").click((e) => {
            this.props.addCallback($modal);
        });
    }
}