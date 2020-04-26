/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

declare global {
  interface Window {
    webkitAudioContext: AudioContext;
  }
}

// Some browsers use webkitAudioContext instead of plain (unprefixed)
// AudioContext
window.AudioContext = window.AudioContext || window.webkitAudioContext;

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
