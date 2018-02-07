import React, { Component } from 'react';
import Modal from 'react-modal';

import AppModal from './AppModal';
import PitchAnalyzer from './PitchAnalyzer';
import PitchGenerator from './PitchGenerator';
import Temperament from './Temperament';

import './App.css';
import equalTemperament from './temperaments/equal.json';

class App extends Component {
  constructor() {
    super();
    this.state = {
      /** Whether the front panel is being shown. */
      isFrontPanel: true,
      settingsAreOpen: false,
      temperament: new Temperament(equalTemperament),
    };
    this.state.selectedNote = this.state.temperament.referenceName;
    this.state.selectedOctave = this.state.temperament.referenceOctave;

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

  handleSelectNote(note) {
    this.setState({ selectedNote: note });
  }

  handleSelectOctave(octave) {
    this.setState({ selectedOctave: octave });
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
              onSelectNote={this.handleSelectNote.bind(this)}
              onSelectOctave={this.handleSelectOctave.bind(this)}
              selectedNote={this.state.selectedNote}
              selectedOctave={this.state.selectedOctave}
              temperament={this.state.temperament}
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
          isOpen={this.state.settingsAreOpen}
          onRequestClose={this.handleCloseSettings.bind(this)}
          title="Settings"
        >
          <h1>lol no settings</h1>
          <h2>lol subtitle</h2>
        </AppModal>
      </div>
    );
  }
}

export default App;
