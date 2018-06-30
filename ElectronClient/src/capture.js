import React from 'react';
import ReactDOM from 'react-dom';
import Viewer from './react/viewer';
const $ = require("./jquery")

$(document).ready(() => {
    ReactDOM.render(
        <Viewer />,
        document.getElementById("viewerContainer")
    );
});

