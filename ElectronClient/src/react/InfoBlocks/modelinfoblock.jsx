import React, {Component} from 'react';
import Block from '../block';

export default class ModelInfoBlock extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const model_info = this.props.model_info;

        return (
            <Block title="Model Info" containerClass="model_info">
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
            </Block>
        );
    }
}