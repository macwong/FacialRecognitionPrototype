import React, {Component} from 'react';
import Helpers from '../helpers';

export default class Info extends Component {
    constructor(props) {
        super(props);

        this.state = {
            prediction: props.prediction
        }
    }

    render() {
        const pred = this.state.prediction;

        if (pred === undefined) {
            return <div></div>;
        }

        return (
            <div className="info">
                <figure className="profile">
                    <img className="profile-pic" src={Helpers.pngSource + pred.image} />
                    <figcaption className="caption">
                        <h2>{pred.pred_name}</h2>
                    </figcaption>
                    <img className="icon" src={Helpers.getPredictionIcon(Helpers.getIndividualPredictionInfo(pred.pred_info, pred.pred_name).distance)} />
                </figure>
                <div className="scores">
                    <div className="Rtable Rtable--2cols Rtable--collapse">
                        <div className="table-header Rtable-cell Rtable-cell--alignCenter"><h3>Probability</h3></div>
                        <div className="table-cell probability Rtable-cell Rtable-cell--alignCenter">
                        5%
                        </div>

                        <div className="table-header Rtable-cell Rtable-cell--alignCenter"><h3>Distance</h3></div>
                        <div className="table-cell distance Rtable-cell Rtable-cell--alignCenter">
                        0.75
                        </div>
                    </div>
                </div>
                <div className="block model-info collapsed">
                    <div className="expandable">
                        <img className="expand-icon" src="../images/arrow-down.png" />
                        <h3>Model Info</h3>
                    </div>
                    <div className="block-details">
                        <ul>
                            <li>
                                <label>Name:</label><span className="model-name">Model name</span>
                            </li>
                            <li>
                                <label>Total People:</label><span className="total-people">Total people</span>
                            </li>
                            <li>
                                <label>Total Images:</label><span className="training-images">Training images</span>
                            </li>
                            <li>
                                <label>Algorithm:</label>
                                <div className="algorithm">Algorithm</div>
                            </li>
                            <li>
                                <label>People:</label>
                                <div>
                                    <ul className="nice-list people-list">
                                        <li>List Item</li>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="block embeddings collapsed">
                    <div className="expandable">
                        <img className="expand-icon" src="../images/arrow-down.png" />
                        <h3>Embeddings</h3>
                    </div>
                    <div className="block-details">
                        <span className="emb">0.5435345</span>
                    </div>
                </div>
                <div className="block top-predictions collapsed">
                    <div className="expandable">
                        <img className="expand-icon" src="../images/arrow-down.png" />
                        <h3>Top Predictions</h3>
                    </div>
                    <div className="block-details">
                    </div>
                </div>
                <div className="block add-face collapsed">
                    <div className="expandable">
                        <img className="expand-icon" src="../images/arrow-down.png" />
                        <h3>Add Face</h3>
                    </div>
                    <div className="block-details">
                        <div className="editable-dropdown">
                            <input className="input" list="names" name="name" />
                            <datalist id="names" className="data-list">
                                <option value="Diep Nguyen" />
                            </datalist>
                        </div>
                        <div className="add-container">
                            <button className="add-new-face">Add</button>
                            <div className="add-info">Clicking "Add" will add this person to the training data.</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    updateInfo(preds) {
        this.setState({
            prediction: preds
        });
    }
}