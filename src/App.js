/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { Component } from 'react';
import Modal from 'react-modal';
import cloneDeep from 'lodash.clonedeep';

import AppModal from './AppModal';
import { SettingsItem, SettingsExpanderGroup } from './AppSettings';
import PitchAnalyser from './PitchAnalyser';
import PitchGenerator from './PitchGenerator';
import Temperament from './Temperament';

import './App.css';
import equalTemperament from './temperaments/equal.json';
import quarterCommaMeantone from './temperaments/quarterCommaMeantone.json';

/** All the built-in temperaments. */
const builtInTemperaments = [equalTemperament, quarterCommaMeantone];

export default class App extends Component {
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
    this.setState(state => {
      let temperament;
      let pitchText = this.referencePitchInput.value.trim();
      if (/^[0-9]+$/.test(pitchText)) {
        // TODO: do we really need a deep clone here?  It seems like the safest
        // option for now, and not terribly expensive.
        temperament = cloneDeep(state.temperament);
        temperament.referencePitch = parseInt(pitchText, 10);
      } else {
        temperament = state.temperament;
      }
      return { settingsAreOpen: false, temperament };
    });
  }

  handleSettingsOpen() {
    this.setState({ settingsAreOpen: true });
  }

  handleTemperamentSelect(temperamentData) {
    let temperament = new Temperament(temperamentData);
    this.setState({
      temperament,
      selectedNote: temperament.referenceName,
      selectedOctave: temperament.referenceOctave,
    });
  }

  handleViewFlip() {
    this.setState(state => {
      return { isFrontPanel: !state.isFrontPanel };
    });
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
          <div className="App-front" aria-hidden={!this.state.isFrontPanel}>
            <PitchGenerator
              isFocusable={this.state.isFrontPanel}
              onNoteSelect={this.handleNoteSelect.bind(this)}
              onOctaveSelect={this.handleOctaveSelect.bind(this)}
              onSettingsOpen={this.handleSettingsOpen.bind(this)}
              onViewFlip={this.handleViewFlip.bind(this)}
              selectedNote={this.state.selectedNote}
              selectedOctave={this.state.selectedOctave}
              temperament={this.state.temperament}
            />
          </div>
          <div className="App-back" aria-hidden={this.state.isFrontPanel}>
            <PitchAnalyser
              isFocusable={!this.state.isFrontPanel}
              onSettingsOpen={this.handleSettingsOpen.bind(this)}
              onViewFlip={this.handleViewFlip.bind(this)}
              temperament={this.state.temperament}
            />
          </div>
        </div>
        <AppModal
          isOpen={this.state.settingsAreOpen}
          onRequestClose={this.handleSettingsClose.bind(this)}
          title="Settings"
        >
          <div className="App-settings-container">
            <SettingsExpanderGroup
              isFocusable={true}
              label={`Temperament: ${this.state.temperament.name}`}
            >
              {builtInTemperaments.map(temperament => (
                <SettingsItem
                  key={temperament.name}
                  isSelected={temperament.name === this.state.temperament.name}
                  onClick={() => this.handleTemperamentSelect(temperament)}
                >
                  {temperament.name}
                </SettingsItem>
              ))}
            </SettingsExpanderGroup>
            <SettingsItem>
              Reference pitch:
              <input
                ref={input => {
                  this.referencePitchInput = input;
                }}
                className="App-reference-input"
                isFocusable={true}
                pattern="[0-9]*"
                placeholder={this.state.temperament.referencePitch}
                type="text"
              />
              Hz
            </SettingsItem>
          </div>
        </AppModal>
      </div>
    );
  }
}
