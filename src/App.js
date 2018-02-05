import React, { Component } from 'react';
import Modal from 'react-modal';

import AppModal from './AppModal';
import PitchAnalyzer from './PitchAnalyzer';
import PitchGenerator from './PitchGenerator';

import './App.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      /** Whether the front panel is being shown. */
      isFrontPanel: true,
      notesModalIsOpen: false,
      octavesModalIsOpen: false,
      settingsAreOpen: false,
    };
    // TODO: is this correct?  Documentation is a bit sparse on this feature,
    // and this probably isn't what I want; I'm pretty sure this hides the
    // *entire app* from screen readers, including the modal.
    Modal.setAppElement(document.getElementById('root'));
  }

  handleCloseNotesModal() {
    this.setState({ notesModalIsOpen: false });
  }

  handleCloseOctavesModal() {
    this.setState({ octavesModalIsOpen: false });
  }

  handleCloseSettings() {
    this.setState({ settingsAreOpen: false });
  }

  handleFlipView() {
    this.setState({ isFrontPanel: !this.state.isFrontPanel });
  }

  handleOpenNotesModal() {
    this.setState({ notesModalIsOpen: true });
  }

  handleOpenOctavesModal() {
    this.setState({ octavesModalIsOpen: true });
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
              onOpenNotesModal={this.handleOpenNotesModal.bind(this)}
              onOpenOctavesModal={this.handleOpenOctavesModal.bind(this)}
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
        <AppModal
          isOpen={this.state.notesModalIsOpen}
          onRequestClose={this.handleCloseNotesModal.bind(this)}
        >
          <h1>Notes go here</h1>
        </AppModal>
        <AppModal
          isOpen={this.state.octavesModalIsOpen}
          onRequestClose={this.handleCloseOctavesModal.bind(this)}
        >
          <h1>Octaves go here</h1>
        </AppModal>
        <AppModal
          isOpen={this.state.settingsAreOpen}
          onRequestClose={this.handleCloseSettings.bind(this)}
        >
          <h1>lol no settings</h1>
          <h2>lol subtitle</h2>
        </AppModal>
      </div>
    );
  }
}

export default App;
