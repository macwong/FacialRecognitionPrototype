import React, {Component} from 'react';

export default class PredictionPhoto extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <figure className="person">
                <img src={this.props.src} />
                <figcaption className="caption">{this.props.name}</figcaption>
                <img className="icon" src={this.getPredictionIcon(this.props.distance)} />
            </figure>
        );
    }

    getPredictionIcon(distance) {
        if (distance < 0.75) {
            return "../images/verified.png";
        }
        else if (distance < 0.9) {
            return "../images/like.png";
        }
        else if (distance < 1.05) {
            return "../images/maybe.png";
        }
        else if (distance < 1.2) {
            return "../images/noidea.png";
        }
        else {
            return "../images/rotten.png";
        }
    }
}

