import React, {Component} from 'react';
import Controls from './ViewerControls/controls';

export default class Viewer extends Component {
    constructor(props) {
        super(props);
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
}