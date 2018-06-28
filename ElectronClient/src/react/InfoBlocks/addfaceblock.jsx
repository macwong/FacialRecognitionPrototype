import React, {Component} from 'react';
import Block from '../block';
import $ from 'jquery';
import path from 'path';
import Helpers from '../../helpers';

export default class AddFaceBlock extends Component {
    constructor(props) {
        super(props);

        this.state = {
            addFace: "",
            buttonClass: "add-new-face",
            infoMessage: "Clicking \"Add\" will add this person to the training data."
        };
    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.addFace !== prevProps.addFace) {
            this.setState({
                addFace: "",
                buttonClass: "add-new-face",
                infoMessage: "Clicking \"Add\" will add this person to the training data."
            })
        }
    }

    render() {
        return (
            <Block title="Add Face" containerClass="add-face">
                <div className="editable-dropdown">
                    <input 
                        onChange={ this.handleChange.bind(this) }
                        value={this.state.addFace} 
                        className="input" list="names" name="name" 
                    />
                    <datalist id="names" className="data-list">
                    {
                        this.props.model_info.class_names.map((name) => {
                            return (
                                <option key={name} value={name} />
                            );
                        })
                    }
                    </datalist>
                </div>
                <div className="add-container">
                    <button className={this.state.buttonClass} onClick={this.onAddNewFaceClick.bind(this)}>Add</button>
                    <div className="add-info">{this.state.infoMessage}</div>
                </div>
            </Block>
        );
    }

    handleChange(e) {
        this.setState({ addFace: e.target.value });
    }

    onAddNewFaceClick(e) {
        let $button = $(e.currentTarget); 
        let model_name = this.props.model_info.model_name;

        if (!$button.hasClass("disabled")) {
            $.ajax({
                url: path.join(Helpers.endpoint, "addface"),
                type: "POST",
                data: JSON.stringify({
                    image: this.props.image,
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

            this.setState({
                buttonClass: this.state.buttonClass + " disabled"
            });
        }
    }


}