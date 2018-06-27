import React, {Component} from 'react';
import Block from '../block';

export default class EmbeddingsBlock extends Block {
    constructor(props) {
        super(props);
    }

    renderBlockDetails() {
        return (
            <div>
            {
                this.props.prediction.embeddings.map((emb, index) => {
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
        );
    }
}