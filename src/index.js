import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

// Some browsers use webkitAudioContext instead of plain (unprefixed)
// AudioContext.
window.AudioContext = window.AudioContext || window.webkitAudioContext;

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
