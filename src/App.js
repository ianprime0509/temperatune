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
import {
  SettingsItem,
  SettingsFileChooser,
  SettingsExpanderGroup,
} from './AppSettings';
import Button from './Button';
import PitchAnalyser from './PitchAnalyser';
import PitchGenerator from './PitchGenerator';
import Temperament from './Temperament';

import './App.css';
import equalTemperament from './temperaments/equal.json';
import quarterCommaMeantone from './temperaments/quarterCommaMeantone.json';

/**
 * All the built-in temperaments, as plain objects.  These are not actually
 * instances of `Temperament`; rather, they are only the base data.  This is so
 * that there's no delay in loading the rest of the app just to precompute a
 * bunch of temperament data that probably won't get used.
 */
const builtInTemperaments = [equalTemperament, quarterCommaMeantone];
/**
 * All the user temperaments, as `Temperament` objects.  Unlike the built-in
 * temperaments, user temperaments are processed when they are chosen, because
 * the user has expressed an intent to use them.
 */
const userTemperaments = [];

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      /**
       * The stack of alert messages currently being shown.  Each alert is a
       * pair, with the first element being a heading and the second element a
       * description.
       */
      alerts: [],
      /** Whether the front panel is being shown. */
      isFrontPanel: true,
      settingsAreOpen: false,
      temperament: new Temperament(equalTemperament),
    };
    this.state.selectedNote = this.state.temperament.referenceName;
    this.state.selectedOctave = this.state.temperament.referenceOctave;

    Modal.setAppElement(document.getElementById('root'));
  }

  /** Close the alert on the top of the stack. */
  handleAlertClose() {
    this.setState(state => {
      return {
        alerts: state.alerts.slice(0, -1),
      };
    });
  }

  handleAlertOpen(title, description) {
    this.setState(state => {
      return { alerts: state.alerts.concat([[title, description]]) };
    });
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

  handleTemperamentSelect(temperament) {
    this.setState({
      temperament,
      selectedNote: temperament.referenceName,
      selectedOctave: temperament.referenceOctave,
    });
  }

  handleTemperamentFileSelect(file) {
    let url = URL.createObjectURL(file);
    fetch(url)
      .then(response => {
        return response.json();
      })
      .then(json => {
        let temperament;
        try {
          temperament = new Temperament(json);
        } catch (err) {
          this.handleAlertOpen('Error', `Invalid temperament input: ${err}`);
          return;
        }
        // We aren't allowed to have a temperament with the same name as some
        // other temperament, or it would cause confusion.
        let sameName = t => t.name === temperament.name;
        if (
          builtInTemperaments.some(sameName) ||
          userTemperaments.some(sameName)
        ) {
          this.handleAlertOpen(
            'Error',
            `Temperament with name ${temperament.name} already exists.`
          );
          return;
        }
        userTemperaments.push(temperament);
        this.setState({
          temperament,
          selectedNote: temperament.referenceName,
          selectedOctave: temperament.referenceOctave,
        });
      })
      .catch(err => {
        this.handleAlertOpen('Error', `Could not get JSON data: ${err}`);
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
              onAlertOpen={this.handleAlertOpen.bind(this)}
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
              onAlertOpen={this.handleAlertOpen.bind(this)}
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
              {builtInTemperaments.map(temperamentData => (
                <SettingsItem
                  key={temperamentData.name}
                  isSelected={
                    temperamentData.name === this.state.temperament.name
                  }
                  onClick={() => {
                    let temperament = new Temperament(temperamentData);
                    this.handleTemperamentSelect(temperament);
                  }}
                >
                  {temperamentData.name}
                </SettingsItem>
              ))}
              {userTemperaments.map(temperament => (
                <SettingsItem
                  key={temperament.name}
                  isSelected={temperament.name === this.state.temperament.name}
                  onClick={() => this.handleTemperamentSelect(temperament)}
                >
                  {temperament.name}
                </SettingsItem>
              ))}
              <SettingsFileChooser
                label="Choose file"
                onFileSelect={this.handleTemperamentFileSelect.bind(this)}
              />
            </SettingsExpanderGroup>
            <SettingsItem>
              Reference pitch:
              <input
                ref={input => {
                  this.referencePitchInput = input;
                }}
                className="App-reference-input"
                pattern="[0-9]*"
                placeholder={this.state.temperament.referencePitch}
                tabIndex={0}
                type="text"
              />
              Hz
            </SettingsItem>
          </div>
        </AppModal>
        {this.state.alerts.map((alert, i) => {
          let descriptionId = 'description-' + String(i);

          return (
            <AppModal
              key={i}
              aria={{ describedby: descriptionId }}
              isOpen={true}
              onRequestClose={this.handleAlertClose.bind(this)}
              title={alert[0]}
            >
              <div className="App-alert-content">
                <p className="App-alert-description" id={descriptionId}>
                  {alert[1]}
                </p>
                <Button
                  fontSizeRem={1.5}
                  label="OK"
                  onClick={this.handleAlertClose.bind(this)}
                  tabIndex={0}
                />
              </div>
            </AppModal>
          );
        })}
      </div>
    );
  }
}
