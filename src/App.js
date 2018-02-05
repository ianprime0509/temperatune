import React, { Component } from 'react';
import Modal from 'react-modal';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/fontawesome-free-solid';

import PitchAnalyzer from './PitchAnalyzer';
import PitchGenerator from './PitchGenerator';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      /** Whether the front panel is being shown. */
      isFrontPanel: true,
      settingsAreOpen: false,
    };
    // TODO: is this correct?  Documentation is a bit sparse on this feature,
    // and this probably isn't what I want; I'm pretty sure this hides the
    // *entire app* from screen readers, including the modal.
    Modal.setAppElement(document.getElementById('root'));
  }

  handleCloseSettings() {
    this.setState({ settingsAreOpen: false });
  }

  handleFlipView() {
    this.setState({ isFrontPanel: !this.state.isFrontPanel });
  }

  handleOpenSettings() {
    this.setState({ settingsAreOpen: true });
  }

  render() {
    let flipperClasses = 'App-flipper';
    if (!this.state.isFrontPanel) {
      flipperClasses += ' flipped';
    }

    return (
      // Using a variant of https://davidwalsh.name/css-flip for the flip
      // animation
      <div className="App">
        <div className={flipperClasses} id="App-flipper">
          <div className="App-front">
            <PitchGenerator
              onFlipView={this.handleFlipView.bind(this)}
              onOpenSettings={this.handleOpenSettings.bind(this)}
            />
          </div>
          <div className="App-back">
            <PitchAnalyzer
              onFlipView={this.handleFlipView.bind(this)}
              onOpenSettings={this.handleOpenSettings.bind(this)}
            />
          </div>
        </div>
        <Modal
          className="Settings-content"
          overlayClassName="Modal-overlay"
          isOpen={this.state.settingsAreOpen}
          onRequestClose={this.handleCloseSettings.bind(this)}
        >
          <FontAwesomeIcon
            icon={faTimes}
            size="2x"
            className="Settings-close"
            onClick={this.handleCloseSettings.bind(this)}
          />
          <h1>lol no settings</h1>
        </Modal>
      </div>
    );
  }
}

export default App;
