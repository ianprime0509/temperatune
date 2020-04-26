/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { FC } from 'react';
import { faMusic } from '@fortawesome/free-solid-svg-icons';
import { Temperament, prettifyNoteName } from 'temperament';

import SettingsBar from './SettingsBar';

import './PitchAnalyser.css';

/** The maximum offset that should still be considered perfect. */
export const PERFECT_OFFSET = 5;
/** The minimum offset that should be considered completely off. */
export const BAD_OFFSET = 50;

/**
 * Computes the hue that should be used to represent the closeness to a note.
 *
 * @param offset - the offset from the correct note, in cents
 * @returns the hue to be used
 */
const getHue = (offset: number): number => {
  let abs = Math.abs(offset);
  if (abs > BAD_OFFSET) {
    return 0;
  } else if (abs > PERFECT_OFFSET) {
    const a = 120 / (PERFECT_OFFSET - BAD_OFFSET);
    return a * (abs - BAD_OFFSET);
  } else {
    return 120;
  }
};

/**
 * Get a description of the given offset.
 *
 * For example, an offset of -5 will return 'Flat by 5 cents'.
 */
const getOffsetString = (offset: number): string => {
  if (Math.abs(offset) < PERFECT_OFFSET) {
    return 'In tune';
  }

  let flatOrSharp = offset < 0 ? 'Flat' : 'Sharp';
  // I'm trusting that PERFECT_OFFSET will always be bigger than 1, so we don't
  // have to worry about 'cents' vs 'cent'.
  return flatOrSharp + ` by ${Math.round(Math.abs(offset))} cents`;
};

interface PitchAnalyserProps {
  detectedNote: string;
  detectedOffset: number;
  isFocusable: boolean;
  temperament: Temperament;

  onSettingsOpen?: () => void;
  onViewFlip?: () => void;
}

/**
 * The component handling the "pitch detection" panel of the tuner.
 */
const PitchAnalyser: FC<PitchAnalyserProps> = ({
  detectedNote,
  detectedOffset,
  isFocusable,
  onSettingsOpen,
  onViewFlip,
}) => {
  const background = detectedNote
    ? `hsl(${getHue(detectedOffset)}, 70%, 80%)`
    : '#e7e7e7';
  const noteName = detectedNote ? prettifyNoteName(detectedNote) : '-';
  const offsetString = detectedNote ? getOffsetString(detectedOffset) : '';

  return (
    <div className="PitchAnalyser" style={{ background }}>
      <span className="PitchAnalyser-note">{noteName}</span>
      <span className="PitchAnalyser-offset">{offsetString}</span>
      <SettingsBar
        isFocusable={isFocusable}
        switchIcon={faMusic}
        onSettingsOpen={onSettingsOpen}
        onViewFlip={onViewFlip}
      />
    </div>
  );
};

export default PitchAnalyser;
