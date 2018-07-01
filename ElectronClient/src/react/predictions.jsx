import React, {Component} from 'react';
import Helpers from '../helpers';
import Globals from '../globals';

export default class Predictions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            predictions: props.predictions,
            success: props.success,
            error: props.error
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.predictions !== prevProps.predictions) {
            this.setState({
                predictions: this.props.predictions,
                success: this.props.success,
                error: this.props.error
            });
        }
    }

    render() {
        return (
            <div id="resultsContainer" className="resultsContainer">
                <div id="resultsContents" className="resultsContents">
                    {this.renderList()}
                </div>
                <div id="resultsOverlay" className="resultsOverlay"></div>
            </div>
        );
    }

    renderList() {
        if (!this.state.success) {
            return (
                <div>{this.state.error}</div>
            );
        }
        else if (!this.state.predictions || this.state.predictions.length === 0) {
            return (
                <div>Dude! You're invisible!</div>
            );
        }
        else {
            return this.state.predictions.map((pred) => {
                const distance = Helpers.getIndividualPredictionInfo(pred.pred_info, pred.pred_name).distance;

                return (
                    <figure key={pred.prediction_id} className="person">
                        <img src={Globals.pngSource + pred.image} />
                        <figcaption className="caption">{pred.pred_name}</figcaption>
                        <img className="icon" src={Helpers.getPredictionIcon(distance)} />
                    </figure>
                );
            });
        }
    }

    updatePredictions(preds, success, error) {
        this.setState({
            predictions: preds,
            success: success,
            error: error
        });
    }
}