import React, {Component} from 'react';

export default class Controls extends Component {
    render() {
        return (
            <div className="controlsContainer">
                <div className="models-container">
                    <div className="models">
                    </div>
                    <div>
                        <button className="add-model">Add</button>
                    </div>
                </div>
                <div className="segmented">
                    <label className="checked option-live"><input type="radio" name="segmented" defaultChecked={true} />Live</label>
                    <label className="option-video"><input type="radio" name="segmented" />Video</label>
                    <label className="option-image"><input type="radio" name="segmented" />Image</label>
                </div>
                <div className='busyMode'>
                    <div className='field'>
                        <label className='label label-toggle' htmlFor='night-mode2'>
                        <div className='input-toggle'>
                            <input className='input-checkbox' id='night-mode2' type='checkbox' />
                            <span className='input-toggle-handle'></span>
                        </div>
                        </label>
                    </div>
                </div>
            </div>
        );
    }
}