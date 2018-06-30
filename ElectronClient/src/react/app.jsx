import React, {Component} from 'react';
import Viewer from './viewer';

export default class App extends Component {
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
}