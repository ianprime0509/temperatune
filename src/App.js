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

  handleNoteSelect(note) {
    this.setState({ selectedNote: note });
  }

  handleOctaveSelect(octave) {
    this.setState({ selectedOctave: octave });
  }

  handleSettingsClose() {
    this.setState({ settingsAreOpen: false });
  }

  handleSettingsOpen() {
    this.setState({ settingsAreOpen: true });
  }

  handleViewFlip() {
    this.setState({ isFrontPanel: !this.state.isFrontPanel });
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
              onNoteSelect={this.handleNoteSelect.bind(this)}
              onOctaveSelect={this.handleOctaveSelect.bind(this)}
              onSettingsOpen={this.handleSettingsOpen.bind(this)}
              onViewFlip={this.handleViewFlip.bind(this)}
              selectedNote={this.state.selectedNote}
              selectedOctave={this.state.selectedOctave}
              temperament={this.state.temperament}
            />
          </div>
          <div className="App-back">
            <PitchAnalyzer
              onSettingsOpen={this.handleSettingsOpen.bind(this)}
              onViewFlip={this.handleViewFlip.bind(this)}
            />
          </div>
        </div>
        <AppModal
          isOpen={this.state.settingsAreOpen}
          onRequestClose={this.handleSettingsClose.bind(this)}
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
