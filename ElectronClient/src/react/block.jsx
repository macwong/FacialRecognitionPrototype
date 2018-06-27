import React, {Component} from 'react';
import $ from 'jquery';

export default class Block extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={`block ${this.props.containerClass} collapsed`}>
                <div 
                    className="expandable"
                    onClick={this.onBlockClick.bind(this)}
                >
                    <img className="expand-icon" src="../images/arrow-down.png" />
                    <h3>{this.props.title}</h3>
                </div>
                <div className="block-details">
                    {this.props.children}
                </div>
            </div>
        );
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
}