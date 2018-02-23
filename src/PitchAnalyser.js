/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { faMusic } from '@fortawesome/fontawesome-free-solid';
import { findPitch } from 'pitchy';

import SettingsBar from './SettingsBar';
import Temperament, { prettifyNoteName } from './Temperament';

import './PitchAnalyser.css';

// The maximum offset that should still be considered perfect.
const PERFECT_OFFSET = 5;
// The minimum offset that should be considered completely off.
const BAD_OFFSET = 50;

/**
 * The component handling the "pitch detection" panel of the tuner.
 */
export default class PitchAnalyser extends Component {
  constructor() {
    super();
    this.state = {
      analyserNode: null,
      audioContext: new window.AudioContext(),
      /** The current detected note. */
      note: null,
      /** The offset of the current pitch from the detected note. */
      offset: 0,
    };
    this.getMicrophoneInput();
  }

  componentDidMount() {
    window.setInterval(() => this.updateNote(), 100);
  }

  /** Starts the process of getting microphone access. */
  getMicrophoneInput() {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(this.handleGetInputStream.bind(this))
      .catch(err => console.error(`Could not get audio input: ${err}`));
  }

  /** Sets up the analyserNode with the provided input stream. */
  handleGetInputStream(stream) {
    this.setState(state => {
      let ctx = state.audioContext;
      let analyserNode = ctx.createAnalyser();
      let sourceNode = ctx.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);

      return { analyserNode };
    });
  }

  updateNote() {
    this.setState((state, props) => {
      let ctx = state.audioContext;
      let analyserNode = state.analyserNode;

      if (!analyserNode) {
        // Nothing to get updates from.
        return {};
      }
      let data = new Float32Array(analyserNode.fftSize);
      analyserNode.getFloatTimeDomainData(data);
      let [pitch, clarity] = findPitch(data, ctx.sampleRate);
      if (clarity < 0.8) {
        return { note: null, offset: 0 };
      }
      let [note, offset] = props.temperament.getNoteNameFromPitch(pitch);

      return { note: note, offset };
    });
  }

  render() {
    let background = this.state.note
      ? `hsl(${getHue(this.state.offset)}, 100%, 85%)`
      : '#f0f0f0';
    let noteName = this.state.note ? prettifyNoteName(this.state.note) : '-';
    let offsetString = this.state.note
      ? getOffsetString(this.state.offset)
      : '';

    return (
      <div className="PitchAnalyser" style={{ background }}>
        <span className="PitchAnalyser-note">{noteName}</span>
        <span className="PitchAnalyser-offset">{offsetString}</span>
        <SettingsBar
          isFocusable={this.props.isFocusable}
          onSettingsOpen={this.props.onSettingsOpen}
          onViewFlip={this.props.onViewFlip}
          switchIcon={faMusic}
        />
      </div>
    );
  }
}

PitchAnalyser.propTypes = {
  isFocusable: PropTypes.bool,
  onSettingsOpen: PropTypes.func,
  onViewFlip: PropTypes.func,
  temperament: PropTypes.instanceOf(Temperament),
};

/**
 * Compute the hue that should be used to represent the closeness to a note.
 *
 * @param {number} offset The offset from the correct note, in cents.
 * @return {number} The hue to be used.
 */
function getHue(offset) {
  let abs = Math.abs(offset);
  if (abs > BAD_OFFSET) {
    return 0;
  } else if (abs > PERFECT_OFFSET) {
    const a = 120 / (PERFECT_OFFSET - BAD_OFFSET);
    return a * (abs - BAD_OFFSET);
  } else {
    return 120;
  }
}

/**
 * Get a description of the given offset.
 *
 * For example, an offset of -5 will return 'Flat by 5 cents'.
 */
function getOffsetString(offset) {
  if (Math.abs(offset) < PERFECT_OFFSET) {
    return 'In tune';
  }

  let flatOrSharp = offset < 0 ? 'Flat' : 'Sharp';
  // I'm trusting that PERFECT_OFFSET will always be bigger than 1, so we don't
  // have to worry about 'cents' vs 'cent'.
  return flatOrSharp + ` by ${Math.round(Math.abs(offset))} cents`;
}
