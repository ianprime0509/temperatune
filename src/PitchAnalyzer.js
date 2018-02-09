import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { faMusic } from '@fortawesome/fontawesome-free-solid';

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
      let pitch = findFundamentalFrequency(data, ctx.sampleRate);
      if (pitch === -1) {
        return { note: '-', offset: 0 };
      }
      let [note, offset] = props.temperament.getNoteNameFromPitch(pitch);

      return { note, offset };
    });
  }
}

PitchAnalyzer.propTypes = {
  onSettingsOpen: PropTypes.func,
  onViewFlip: PropTypes.func,
  temperament: PropTypes.instanceOf(Temperament),
};

export default PitchAnalyzer;

/**
 * Attempts to determine the fundamental frequency from the given audio (time
 * domain) data.
 *
 * Currently, I've tried to keep this simple by using a basic autocorrelation
 * (https://en.wikipedia.org/wiki/Autocorrelation) method, but other
 * possibilities are available (such as the ones mentioned on
 * https://en.wikipedia.org/wiki/Pitch_detection_algorithm).  The sample rate
 * must be provided along with the time-domain data in order to calculate the
 * pitch in Hz from the data period.
 *
 * The time-domain input data should be a Float32Array.
 *
 * @return The fundamental frequency, or -1 if it wasn't clear from the data.
 */
function findFundamentalFrequency(timeData, sampleRate) {
  // The minimum correlation to accept.
  const MIN_CORRELATION = 0.1;
  // The minimum frequency we care to detect (in Hz).
  const MIN_FREQ = 60;
  // The maximum frequency we care to detect (in Hz).
  const MAX_FREQ = 4000;
  // The starting value of k (the time domain period).
  const kStart = Math.round(sampleRate / MAX_FREQ);
  // The ending value of k.
  const kEnd = Math.round(sampleRate / MIN_FREQ);
  // The best correlation found so far, with the corresponding k.
  let correlation = 0;
  let kBest = -1;

  for (let k = kStart; k <= kEnd; k++) {
    // Find the autocorrelation using this period.
    const nSamples = timeData.length - k;
    let autocorrelation = 0;
    for (let i = 0; i < nSamples; i++) {
      autocorrelation += timeData[i] * timeData[i + k];
    }
    autocorrelation /= nSamples;

    if (autocorrelation > correlation) {
      correlation = autocorrelation;
      kBest = k;
    }
  }

  return correlation < MIN_CORRELATION ? -1 : sampleRate / kBest;
}
