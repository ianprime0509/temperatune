import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { faMusic } from '@fortawesome/fontawesome-free-solid';
import { mpm } from 'pitchy';

import SettingsBar from './SettingsBar';
import Temperament, { prettifyNoteName } from './Temperament';

import './PitchAnalyzer.css';

// The maximum offset that should still be considered perfect.
const PERFECT_OFFSET = 5;
// The minimum offset that should be considered completely off.
const BAD_OFFSET = 50;


/**
 * The component handling the "pitch detection" panel of the tuner.
 *
 * For anyone wondering, "analyzer" is the American spelling and "analyser" is
 * the British spelling; the WebAudio spec uses the latter.  I might decide at
 * some point that having both spellings is useless and change mine to match.
 */
export default class PitchAnalyzer extends Component {
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
    this._getMicrophoneInput();
  }

  componentDidMount() {
    window.setInterval(() => this._updateNote(), 100);
  }

  render() {
    let background = this.state.note ?
      `hsl(${getHue(this.state.offset)}, 100%, 85%)` :
      '#f7f7f7';
    let noteName = this.state.note ? prettifyNoteName(this.state.note) : '-';
    let offsetString = this.state.note ?
      getOffsetString(this.state.offset) :
      '';

    return (
      <div className="PitchAnalyzer" style={{ background }}>
        <span className="PitchAnalyzer-note">
          {noteName}
        </span>
        <span className="PitchAnalyzer-offset">
          {offsetString}
        </span>
        <SettingsBar
          switchIcon={faMusic}
          onSettingsOpen={this.props.onSettingsOpen}
          onViewFlip={this.props.onViewFlip}
        />
      </div>
    );
  }

  /** Starts the process of getting microphone access. */
  _getMicrophoneInput() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(this._handleGetInputStream.bind(this))
      .catch((err) => console.error(`Could not get audio input: ${err}`));
  }

  /** Sets up the analyserNode with the provided input stream. */
  _handleGetInputStream(stream) {
    this.setState((state) => {
      let ctx = state.audioContext;
      let analyserNode = ctx.createAnalyser();
      let sourceNode = ctx.createMediaStreamSource(stream);
      sourceNode.connect(analyserNode);

      return { analyserNode };
    });
  }

  _updateNote() {
    this.setState((state, props) => {
      let ctx = state.audioContext;
      let analyserNode = state.analyserNode;

      if (!analyserNode) {
        // Nothing to get updates from.
        return {};
      }
      let data = new Float32Array(analyserNode.fftSize);
      analyserNode.getFloatTimeDomainData(data);
      let [pitch, clarity] = mpm(data, ctx.sampleRate);
      if (clarity < 0.8) {
        return { note: null, offset: 0 };
      }
      let [note, offset] = props.temperament.getNoteNameFromPitch(pitch);

      return { note: note, offset };
    });
  }
}

PitchAnalyzer.propTypes = {
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
