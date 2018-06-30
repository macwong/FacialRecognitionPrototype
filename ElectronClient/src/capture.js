import React from 'react';
import ReactDOM from 'react-dom';
import App from './react/app';
import $ from 'jquery';

$(document).ready(() => {
    ReactDOM.render(
        <App />,
        document.getElementById("container")
    );
});

