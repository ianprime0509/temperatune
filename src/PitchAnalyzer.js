import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { faMusic } from '@fortawesome/fontawesome-free-solid';
import { mpm } from 'pitchy';

import SettingsBar from './SettingsBar';
import Temperament, { prettifyNoteName } from './Temperament';

import './PitchAnalyzer.css';

/**
 * The component handling the "pitch detection" panel of the tuner.
 *
 * For anyone wondering, "analyzer" is the American spelling and "analyser" is
 * the British spelling; the WebAudio spec uses the latter.  I might decide at
 * some point that having both spellings is useless and change mine to match.
 */
class PitchAnalyzer extends Component {
  constructor() {
    super();
    this.state = {
      analyserNode: null,
      audioContext: new window.AudioContext(),
      /** The current detected note. */
      note: '-',
      /** The offset of the current pitch from the detected note. */
      offset: 0,
    };
    this._getMicrophoneInput();
  }

  componentDidMount() {
    this._updateNote();
  }

  render() {
    return (
      <div className="PitchAnalyzer">
        <span className="PitchAnalyzer-note">
          {prettifyNoteName(this.state.note)}
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
      // We might as well request the next animation frame here, so that we
      // don't have to remember to do it in every single exit path.
      window.requestAnimationFrame(this._updateNote.bind(this));

      if (!analyserNode) {
        // Nothing to get updates from.
        return {};
      }
      let data = new Float32Array(analyserNode.fftSize);
      analyserNode.getFloatTimeDomainData(data);
      let [pitch, clarity] = mpm(data, ctx.sampleRate);
      if (clarity < 0.8) {
        return { note: '-', offset: 0 };
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

export default PitchAnalyzer;
