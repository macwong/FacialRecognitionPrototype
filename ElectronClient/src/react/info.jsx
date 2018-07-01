import React, {Component} from 'react';
import Helpers from '../helpers';
import Globals from '../globals';
import ModelInfoBlock from './InfoBlocks/modelinfoblock';
import EmbeddingsBlock from './InfoBlocks/embeddingsblock';
import TopPredictionsBlock from './InfoBlocks/toppredictionsblock';
import AddFaceBlock from './InfoBlocks/addfaceblock';

export default class Info extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            prediction: props.prediction
        }
    }

    componentDidUpdate(prevProps) {
        if (this.props.prediction !== prevProps.prediction) {
            this.setState({
                prediction: this.props.prediction
            });
        }
    }

    render() {
        const pred = this.state.prediction;

        if (pred == null || pred === undefined) {
            return <div id="info"></div>;
        }

        const model_info = pred.model_info;

        return (
            <div id="info" className="info">
                <figure className="profile">
                    <img className="profile-pic" src={Globals.pngSource + pred.image} />
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
                <ModelInfoBlock model_info={model_info} />
                <EmbeddingsBlock embeddings={pred.embeddings} />
                <TopPredictionsBlock pred_info={pred.pred_info} />
                <AddFaceBlock 
                    model_info={pred.model_info} 
                    image={pred.image}
                    addFace={pred.pred_name}
                />
            </div>
        );
    }
}