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
import { Temperament, prettifyNoteName } from 'temperament';

import SettingsBar from './SettingsBar';

import './PitchAnalyser.css';

/** The maximum offset that should still be considered perfect. */
export const PERFECT_OFFSET = 5;
/** The minimum offset that should be considered completely off. */
export const BAD_OFFSET = 50;

/**
 * The component handling the "pitch detection" panel of the tuner.
 */
export default class PitchAnalyser extends Component {
  render() {
    let background = this.props.detectedNote
      ? `hsl(${getHue(this.props.detectedOffset)}, 70%, 80%)`
      : '#e7e7e7';
    let noteName = this.props.detectedNote
      ? prettifyNoteName(this.props.detectedNote)
      : '-';
    let offsetString = this.props.detectedNote
      ? getOffsetString(this.props.detectedOffset)
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
  detectedNote: PropTypes.string,
  detectedOffset: PropTypes.number,
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
