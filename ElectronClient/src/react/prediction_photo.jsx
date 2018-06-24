import React, {Component} from 'react';
import Helpers from '../helpers';

export default class PredictionPhoto extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <figure className="person">
                <img src={this.props.src} />
                <figcaption className="caption">{this.props.name}</figcaption>
                <img className="icon" src={Helpers.getPredictionIcon(this.props.distance)} />
            </figure>
        );
    }
}

