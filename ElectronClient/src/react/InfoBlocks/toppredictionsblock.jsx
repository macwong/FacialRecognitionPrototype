import React, {Component} from 'react';
import Block from '../block';
import Helpers from '../../js/helpers';

export default class TopPredictionsBlock extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const pred_info = this.props.pred_info;

        return (
            <Block title="Top Predictions" containerClass="top-predictions">
            {
                pred_info.map((infoItem, index) => {
                    let rating = Helpers.getRating(infoItem.distance);
                    let imgSrc = Helpers.getPredictionIcon(infoItem.distance);

                    return (
                    <div key={index + 1} className="row">
                        <div className="top-name">
                            <span className="top-name-heading">{(index + 1) + ". " + infoItem.name}</span>
                            <span className="rating">
                            {
                                [...Array(rating).keys()].map((val) => {
                                    return <img key={val} src={imgSrc} />
                                })
                            }
                            </span>
                        </div>
                        <div className="more">
                            <label>Training Images:</label>
                            <div className="training-images">
                            {
                                infoItem.photo_path.map((photo, index) => {
                                    return <img key={index} src={photo} />
                                })
                            }
                            </div>
                            <div className="top-scores">
                                <ul>
                                    <li>
                                        <label>Probability:</label><span className="probability">{Helpers.getProbability(infoItem.probability)}</span>
                                    </li>
                                    <li>
                                        <label>Distance:</label><span className="distance">{infoItem.distance.toFixed(2)}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    );
                })
            }
            </Block>
        );
    }
}