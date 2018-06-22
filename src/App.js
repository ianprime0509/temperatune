/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { Component } from 'react';
import ReactModal from 'react-modal';
import cloneDeep from 'lodash.clonedeep';
import { findPitch } from 'pitchy';
import { Temperament } from 'temperament';

import {
  SettingsItem,
  SettingsFileChooser,
  SettingsExpanderGroup,
} from './AppSettings';
import Background from './Background';
import { Modal, Alert } from './Modal';
import PitchAnalyser, { PERFECT_OFFSET, BAD_OFFSET } from './PitchAnalyser';
import PitchGenerator from './PitchGenerator';

import './App.css';
import equalTemperament from './temperaments/equal.json';
import quarterCommaMeantone from './temperaments/quarterCommaMeantone.json';
import pythagoreanD from './temperaments/pythagoreanD.json';

/**
 * The current version of Temperatune.
 */
const VERSION = '0.1.0';

/**
 * All the built-in temperaments, as plain objects.  These are not actually
 * instances of `Temperament`; rather, they are only the base data.  This is so
 * that there's no delay in loading the rest of the app just to precompute a
 * bunch of temperament data that probably won't get used.
 */
const builtInTemperaments = [
  equalTemperament,
  quarterCommaMeantone,
  pythagoreanD,
];
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
       * The stack of alert messages currently being shown.  Each alert is an
       * object with keys `title`, `description` and `isOpen`.  Optionally, the
       * `details` property can provide more information that isn't
       * automatically shown to the user.
       */
      alerts: [],
      appHeight: 0,
      appWidth: 0,
      /** The current detected note. */
      detectedNote: null,
      /** The offset of the current pitch from the detected note. */
      detectedOffset: 0,
      /** Whether the front panel is being shown. */
      isFrontPanel: true,
      /** Whether the tone is being played in the pitch generator. */
      isPlaying: false,
      settingsAreOpen: false,
      temperament: new Temperament(equalTemperament),
    };
    this.state.selectedNote = this.state.temperament.getReferenceName();
    this.state.selectedOctave = this.state.temperament.getReferenceOctave();

    this.audioContext = new AudioContext();
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.start();
    this.analyserNode = this.audioContext.createAnalyser();
    this.microphoneSource = null;
    this.inputNoteInterval = null;

    ReactModal.setAppElement(document.getElementById('root'));
  }

  componentDidMount() {
    window.addEventListener('resize', () => this.handleResize());
  }

  /** Close the alert on the top of the stack. */
  handleAlertClose() {
    this.setState(state => {
      // Actually, all we do is set the `isOpen` property of the top-most alert
      // to `false` so that its close animation can play.  The closed alerts
      // will be cleaned up when the next alert is opened.
      let alerts = state.alerts.slice();
      alerts[alerts.length - 1].isOpen = false;
      return { alerts };
    });
  }

  handleAlertOpen(title, description, details) {
    this.setState(state => {
      // We also clean up any alerts that have been closed already.
      let alerts = state.alerts.filter(alert => alert.isOpen);
      return {
        alerts: alerts.concat([{ title, description, details, isOpen: true }]),
      };
    });
  }

  handleNoteSelect(note) {
    this.setState({ selectedNote: note }, () => this.soundUpdate());
  }

  handleOctaveSelect(octave) {
    this.setState({ selectedOctave: octave }, () => this.soundUpdate());
  }

  handlePlayToggle() {
    this.setState(state => {
      if (state.isPlaying) {
        this.soundStop();
      } else {
        this.soundPlay();
      }

      return {
        isPlaying: !state.isPlaying,
      };
    });
  }

  handleReferencePitchChange() {
    this.setState(
      state => {
        let temperament;
        let pitchText = this.referencePitchInput.value.trim();
        if (/^[0-9]+$/.test(pitchText)) {
          // TODO: do we really need a deep clone here?  It seems like the
          // safest option for now, and not terribly expensive.
          temperament = cloneDeep(state.temperament);
          temperament.setReferencePitch(parseInt(pitchText, 10));
        } else {
          temperament = state.temperament;
        }
        return { temperament };
      },
      () => this.soundUpdate()
    );
  }

  /** Handle the window (viewport) resizing to update the canvas background. */
  handleResize() {
    let appBounds = this.app.getBoundingClientRect();
    this.setState({
      appHeight: appBounds.height,
      appWidth: appBounds.width,
    });
  }

  handleSettingsClose() {
    this.setState(state => ({ settingsAreOpen: false }));
  }

  handleSettingsOpen() {
    this.setState({ settingsAreOpen: true });
  }

  handleTemperamentSelect(temperament) {
    this.setState(
      {
        temperament,
        selectedNote: temperament.getReferenceName(),
        selectedOctave: temperament.getReferenceOctave(),
      },
      () => this.soundUpdate()
    );
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
          this.handleAlertOpen(
            'Error',
            'Invalid temperament input.',
            String(err)
          );
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
            `A temperament with the name '${temperament.name}' already exists.`
          );
          return;
        }
        userTemperaments.push(temperament);
        this.handleTemperamentSelect(temperament);
      })
      .catch(err => {
        this.handleAlertOpen(
          'Error',
          'Could not process input file.  Please ensure that you selected the correct file and try again.',
          String(err)
        );
      });
  }

  handleViewFlip() {
    this.setState(state => {
      if (state.isFrontPanel) {
        // We don't want the tuning note to keep playing when we switch over to
        // analyser mode.
        if (state.isPlaying) {
          this.soundStop();
        }
        // Try to obtain the microphone source and start updating the input
        // note.
        this.microphoneSourceObtain()
          .then(() => {
            this.microphoneSource.connect(this.analyserNode);
            this.audioContext.resume();
            this.inputNoteInterval = window.setInterval(
              () => this.inputNoteUpdate(),
              100
            );
          })
          .catch(err =>
            this.handleAlertOpen(
              'Error',
              'Could not get audio input.',
              String(err)
            )
          );
        return { isFrontPanel: false, isPlaying: false };
      } else {
        if (this.inputNoteInterval !== null) {
          // We don't need to be updating the microphone input note if the
          // analyser view isn't open.
          window.clearInterval(this.inputNoteInterval);
          this.inputNoteInterval = null;
          this.microphoneSource.disconnect(this.analyserNode);
        }
        this.audioContext.suspend();
        return { isFrontPanel: true };
      }
    });
  }

  /** Update the input note from the microphone input. */
  inputNoteUpdate() {
    let ctx = this.audioContext;
    let analyserNode = this.analyserNode;

    let data = new Float32Array(analyserNode.fftSize);
    analyserNode.getFloatTimeDomainData(data);
    let [pitch, clarity] = findPitch(data, ctx.sampleRate);
    if (clarity < 0.8) {
      this.setState({ detectedNote: null, detectedOffset: 0 });
      return;
    }
    let [note, offset] = this.state.temperament.getNoteNameFromPitch(pitch);

    this.setState({ detectedNote: note, detectedOffset: offset });
  }

  /** Attempt to get microphone access and set up the source node. */
  microphoneSourceObtain() {
    if (!this.microphoneSource) {
      return navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          this.microphoneSource = this.audioContext.createMediaStreamSource(
            stream
          );
        });
    } else {
      return Promise.resolve();
    }
  }

  /** Begin playing the tuning pitch. */
  soundPlay() {
    this.soundUpdate();
    this.oscillator.connect(this.audioContext.destination);
    this.audioContext.resume();
  }

  /** Stop playing the tuning pitch. */
  soundStop() {
    this.oscillator.disconnect(this.audioContext.destination);
    this.audioContext.suspend();
  }

  /** Update the frequency of the tuning pitch. */
  soundUpdate() {
    let pitch = this.state.temperament.getPitch(
      this.state.selectedNote,
      this.state.selectedOctave
    );
    this.oscillator.frequency.setValueAtTime(
      pitch,
      this.audioContext.currentTime
    );
  }

  render() {
    let flipperClasses = 'App-flipper';
    if (!this.state.isFrontPanel) {
      flipperClasses += ' flipped';
    }

    let backgroundIsActive =
      this.state.isPlaying ||
      (!this.state.isFrontPanel && this.state.detectedNote !== null);
    let wobbliness =
      !this.state.isFrontPanel && this.state.detectedNote
        ? getWobbliness(this.state.detectedOffset)
        : 0;

    return (
      // Using a variant of https://davidwalsh.name/css-flip for the flip
      // animation
      <div>
        <Background
          appHeight={this.state.appHeight}
          appWidth={this.state.appWidth}
          isActive={backgroundIsActive}
          wobbliness={wobbliness}
        />
        <div ref={ref => (this.app = ref)} className="App">
          <div className={flipperClasses} id="App-flipper">
            <div className="App-front" aria-hidden={!this.state.isFrontPanel}>
              <PitchGenerator
                isFocusable={this.state.isFrontPanel}
                isPlaying={this.state.isPlaying}
                onAlertOpen={() => this.handleAlertOpen()}
                onNoteSelect={note => this.handleNoteSelect(note)}
                onOctaveSelect={octave => this.handleOctaveSelect(octave)}
                onPlayToggle={() => this.handlePlayToggle()}
                onSettingsOpen={() => this.handleSettingsOpen()}
                onViewFlip={() => this.handleViewFlip()}
                selectedNote={this.state.selectedNote}
                selectedOctave={this.state.selectedOctave}
                temperament={this.state.temperament}
              />
            </div>
            <div className="App-back" aria-hidden={this.state.isFrontPanel}>
              <PitchAnalyser
                detectedNote={this.state.detectedNote}
                detectedOffset={this.state.detectedOffset}
                isFocusable={!this.state.isFrontPanel}
                onAlertOpen={() => this.handleAlertOpen()}
                onSettingsOpen={() => this.handleSettingsOpen()}
                onViewFlip={() => this.handleViewFlip()}
                temperament={this.state.temperament}
              />
            </div>
          </div>
          <Modal
            isOpen={this.state.settingsAreOpen}
            onRequestClose={() => this.handleSettingsClose()}
            title="Settings"
          >
            <div className="App-settings-container">
              <SettingsExpanderGroup
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
                    tabIndex={0}
                    tooltip={temperamentData.description}
                  >
                    {temperamentData.name}
                  </SettingsItem>
                ))}
                {userTemperaments.map(temperament => (
                  <SettingsItem
                    key={temperament.name}
                    isSelected={
                      temperament.name === this.state.temperament.name
                    }
                    onClick={() => this.handleTemperamentSelect(temperament)}
                    tabIndex={0}
                    tooltip={temperament.description}
                  >
                    {temperament.name}
                  </SettingsItem>
                ))}
                <SettingsFileChooser
                  label="Choose file"
                  onFileSelect={file =>
                    file && this.handleTemperamentFileSelect(file)
                  }
                  tooltip="Select your own temperament."
                />
              </SettingsExpanderGroup>
              <SettingsItem>
                Reference pitch:
                <input
                  ref={input => {
                    this.referencePitchInput = input;
                  }}
                  className="App-reference-input"
                  onBlur={() => this.handleReferencePitchChange()}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      this.handleReferencePitchChange();
                    }
                  }}
                  pattern="[0-9]*"
                  placeholder={this.state.temperament.getReferencePitch()}
                  tabIndex={0}
                  type="text"
                />
                Hz
              </SettingsItem>
              <SettingsExpanderGroup label="About Temperatune">
                <p>Version: {VERSION}</p>
                <p>
                  Temperatune is hosted on GitHub: you can browse its source
                  code{' '}
                  <a href="https://github.com/ianprime0509/temperatune">here</a>.
                  For more information on defining your own temperaments, see{' '}
                  <a href="https://github.com/ianprime0509/temperament/blob/master/README.md">
                    this README
                  </a>.
                </p>
              </SettingsExpanderGroup>
            </div>
          </Modal>
          {this.state.alerts.map((alert, i) => (
            <Alert
              key={i}
              description={alert.description}
              details={alert.details}
              handleAlertClose={() => this.handleAlertClose()}
              isOpen={alert.isOpen}
              title={alert.title}
            />
          ))}
        </div>
      </div>
    );
  }
}

/**
 * Get a wobbliness value from the given pitch offset.  Bigger offsets produce
 * more wobbliness.
 */
function getWobbliness(offset) {
  const MAX = 20; // The maximum wobbliness

  let abs = Math.abs(offset);
  if (abs > BAD_OFFSET) {
    return MAX;
  } else if (abs > PERFECT_OFFSET) {
    const a = MAX / (BAD_OFFSET - PERFECT_OFFSET);
    return a * (abs - PERFECT_OFFSET);
  } else {
    return 0;
  }
}
