import React, {Component} from 'react';
import Controls from './ViewerControls/controls';

export default class Viewer extends Component {
    constructor(props) {
        super(props);

        this.imageProcessor = null;
        this.videoEl = null;
        this.canvasEl = null;
        this.resultsOverlay = null;
        this.history = null;
        this.info = null;
    }

    render() {
        return (
            <div>
                <video className="video" id="video" width="640" height="480" autoPlay></video>
                <canvas className="canvas" id="canvas" width="640" height="480"></canvas>
                <Controls />
            </div>
        );
    }

    componentDidMount() {
        // this.videoEl = document.getElementById("video");
        // this.canvasEl = document.getElementById("canvas");
        // this.resultsOverlay = document.getElementById("resultsOverlay");
        // this.history = document.getElementById("history");
        // this.info = document.getElementById("info");

        // this.imageProcessor = new ImageProcessor(
        //     this.videoEl, 
        //     this.canvasEl, 
        //     this.resultsOverlay, 
        //     this.info
        // );
    }
}