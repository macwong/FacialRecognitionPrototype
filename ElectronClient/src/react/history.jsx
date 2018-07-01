import React, {Component} from 'react';
import Helpers from '../helpers';
import Globals from '../globals';
import $ from '../jquery';

export default class History extends Component {
    constructor(props) {
        super(props);

        this.state = {
            predictionList: []
        };
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.predictions !== prevProps.predictions) {
            this.updateHistory(this.props.predictions);
        }
    }

    render() {
        if (this.state.predictionList.length === 0) {
            return <div id="history" className="history"></div>;
        }

        return (
            <div id="history" className="history">
                {this.state.predictionList.map((predItem) => {
                    return (
                        <div key={predItem.time + predItem.predictions[0].prediction_id}>
                            <div className="prediction-time">{predItem.time}</div>
                            {this.renderList(predItem)}
                        </div>
                    );
                })}
            </div>
        );
    }

    renderList(predItem) {
        return predItem.predictions.map((pred) => {
            return (
                <div 
                    className="row interactive" 
                    key={pred.prediction_id} 
                    data-prediction_id={pred.prediction_id}
                    onClick={this.onRowClick.bind(this)}
                >
                    <img className="predicted-image" src={Globals.pngSource + pred.image} />
                    <div className="row-text">
                        <div className="name">{pred.pred_name}</div>
                        <div className="time">{pred.model_info.model_name}</div>
                        <div className="rating">
                            {this.renderRating(pred)}
                        </div>
                    </div>
                </div>
            );
        });
    }

    renderRating(pred) {
        let individual = Helpers.getIndividualPredictionInfo(pred.pred_info, pred.pred_name);
        let imgSrc = "../images/rotten.png";
        let rating = 1;

        if (individual !== null) {
            rating = Helpers.getRating(individual.distance);
            imgSrc = Helpers.getPredictionIcon(individual.distance);
        }

        return [...Array(rating).keys()].map((val) => {
            return <img key={val} src={imgSrc} />
        });
    }

    onRowClick(e) {
        let $row = $(e.currentTarget);
        $row.closest("#history").find(".row").removeClass("selected");
        $row.addClass("selected");
        let predictionID = $row.data("prediction_id");
        this.props.infoCallback(predictionID);
    }

    updateHistory(preds) {
        const newState = [{
            time: preds[0].pred_time,
            predictions: preds
        }];

        this.setState({
            predictionList: newState.concat(this.state.predictionList)
        });
    }
}
