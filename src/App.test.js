/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'web-audio-test-api';

test('renders without crashing', () => {
  // Another mock, this time for the getUserMedia method of
  // navigator.mediaDevices.
  navigator.mediaDevices = {
    getUserMedia: jest
      .fn()
      .mockReturnValue(Promise.reject(new Error('this is a mock'))),
  };
  // We need to make sure that we give our root element the 'root' id and
  // actually put it in the document body, since react-modal will complain
  // about the app element if we don't.
  let root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  ReactDOM.render(<App />, root);
  ReactDOM.unmountComponentAtNode(root);
});
