import React, {Component} from 'react';
import Helpers from '../helpers';
import $ from '../jquery';
import path from 'path';

export default class Info extends Component {
    
    constructor(props) {
        super(props);
        
        this.infoMessage = "Clicking \"Add\" will add this person to the training data.";
        this.state = {
            prediction: props.prediction,
            addFace: "",
            infoMessage: this.infoMessage
        }
    }

    render() {
        const pred = this.state.prediction;
        const model_info = pred.model_info;

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
                        {Helpers.getProbability(pred.probability)}
                        </div>

                        <div className="table-header Rtable-cell Rtable-cell--alignCenter"><h3>Distance</h3></div>
                        <div className="table-cell distance Rtable-cell Rtable-cell--alignCenter">
                       {pred.distance.toFixed(2)}
                        </div>
                    </div>
                </div>
                <div className="block model-info collapsed">
                    <div 
                        className="expandable"
                        onClick={this.onBlockClick.bind(this)}
                    >
                        <img className="expand-icon" src="../images/arrow-down.png" />
                        <h3>Model Info</h3>
                    </div>
                    <div className="block-details">
                        <ul>
                            <li>
                                <label>Name:</label><span className="model-name">{model_info.model_name}</span>
                            </li>
                            <li>
                                <label>Total People:</label><span className="total-people">{model_info.total_people}</span>
                            </li>
                            <li>
                                <label>Total Images:</label><span className="training-images">{model_info.training_images}</span>
                            </li>
                            <li>
                                <label>Algorithm:</label>
                                <div className="algorithm">{model_info.algorithm}</div>
                            </li>
                            <li>
                                <label>People:</label>
                                <div>
                                    <ul className="nice-list people-list">
                                        {
                                            model_info.class_names.map((cName, index) => {
                                                return (
                                                    <li key={index}>{cName}</li>
                                                );
                                            })
                                        }
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
                    {
                        pred.embeddings.map((emb, index) => {
                            emb = emb.toFixed(5);
                            let embDisplay = emb.toString();

                            if (emb > 0) {
                                embDisplay = " " + embDisplay;
                            }

                            return (
                                <span key={index} className="emb">{embDisplay}</span>
                            );
                        })
                    }
                    </div>
                </div>
                <div className="block top-predictions collapsed">
                    <div className="expandable">
                        <img className="expand-icon" src="../images/arrow-down.png" />
                        <h3>Top Predictions</h3>
                    </div>
                    <div className="block-details">
                    {
                        pred.pred_info.map((infoItem, index) => {
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
                    </div>
                </div>
                <div className="block add-face collapsed">
                    <div className="expandable">
                        <img className="expand-icon" src="../images/arrow-down.png" />
                        <h3>Add Face</h3>
                    </div>
                    <div className="block-details">
                        <div className="editable-dropdown">
                            <input 
                                onChange={ this.handleChange.bind(this) }
                                value={this.state.addFace} 
                                className="input" list="names" name="name" 
                            />
                            <datalist id="names" className="data-list">
                            {
                                model_info.class_names.map((name) => {
                                    return (
                                        <option key={name} value={name} />
                                    );
                                })
                            }
                            </datalist>
                        </div>
                        <div className="add-container">
                            <button className="add-new-face" onClick={this.onAddNewFaceClick.bind(this)}>Add</button>
                            <div className="add-info">{this.state.infoMessage}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    handleChange(e) {
        this.setState({ addFace: e.target.value });
    }

    onBlockClick(e) {
        let $expandable = $(e.currentTarget);
        let $block = $expandable.closest(".block");
        let $details = $block.find(".block-details");

        if ($block.hasClass("collapsed")) {
            $block.removeClass("collapsed");
            $details.slideDown();
        }
        else {
            $block.addClass("collapsed");
            $details.slideUp();
        }
    }

    onAddNewFaceClick(e) {
        let $button = $(e.currentTarget); 
        let model_name = this.state.prediction.model_info.model_name;

        if (!$button.hasClass("disabled")) {
            $.ajax({
                url: path.join(Helpers.endpoint, "addface"),
                type: "POST",
                data: JSON.stringify({
                    image: this.state.prediction.image,
                    model: model_name,
                    name: this.state.addFace
                }),
                contentType: "application/json; charset=utf-8",
                dataType:"json"
            }).done(() => {
                this.setState({
                    infoMessage: "New face added!"
                });
            });

            $button.addClass("disabled");
        }
    }

    updateInfo(preds) {
        this.setState({
            prediction: preds,
            addFace: "",
            infoMessage: this.infoMessage
        });
    }
}