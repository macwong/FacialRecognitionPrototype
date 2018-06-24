import React, {Component} from 'react';
import Helpers from '../helpers';

export default class Predictions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            predictions: props.predictions
        };
    }

    render() {
        return (
            <div className="flex">
                {this.renderList()}
            </div>
        );
    }

    renderList() {
        return this.props.predictions.map((pred) => {
            const distance = Helpers.getIndividualPredictionInfo(pred.pred_info, pred.pred_name).distance;

            return (
                <figure key={pred.prediction_id} className="person">
                    <img src={Helpers.pngSource + pred.image} />
                    <figcaption className="caption">{pred.pred_name}</figcaption>
                    <img className="icon" src={Helpers.getPredictionIcon(distance)} />
                </figure>
            );
        });
    }

    updatePredictions(preds) {
        this.setState({
            predictions: preds
        });
    }
}