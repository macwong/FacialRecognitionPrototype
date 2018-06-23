import React, {Component} from 'react';
import PredictionPhoto from './prediction_photo';
import Helpers from '../helpers';

export default class Predictions extends Component {
    constructor(props) {
        super(props);
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
            return <PredictionPhoto 
                        key={pred.prediction_id}
                        src={this.props.dataURI + pred.image} 
                        name={pred.pred_name} 
                        distance={Helpers.getIndividualPredictionInfo(pred.pred_info, pred.pred_name).distance}
                    />
        });
    }
}