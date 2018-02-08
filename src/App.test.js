import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

test('renders without crashing', () => {
  // Look at this sorry excuse for an AudioContext mock...  TODO: come up with
  // something actually useful.
  window.AudioContext = Object;
  // We need to make sure that we give our root element the 'root' id and
  // actually put it in the document body, since react-modal will complain
  // about the app element if we don't.
  let root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  ReactDOM.render(<App />, root);
  ReactDOM.unmountComponentAtNode(root);
});
