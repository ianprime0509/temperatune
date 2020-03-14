/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { Temperament } from 'temperament';

import { Modal } from './Modal';
import Button from './Button';
import SettingsBar from './SettingsBar';

import './PitchGenerator.css';

/** The playback control. */
function PlaybackControl({ isFocusable, isPlaying, onClick, ...rest }) {
  const icon = isPlaying ? faPause : faPlay;
  return (
    <div className="PlaybackControl">
      <FontAwesomeIcon
        icon={icon}
        className="PlaybackControl-icon"
        onClick={onClick}
        onKeyPress={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick && onClick();
          }
        }}
        tabIndex={isFocusable ? 0 : -1}
        {...rest}
      />
    </div>
  );
}

PlaybackControl.propTypes = {
  isFocusable: PropTypes.bool,
  isPlaying: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

/** The "panel" containing the pitch generator interface. */
export default function PitchGenerator({
  isFocusable,
  isPlaying,
  onNoteSelect,
  onOctaveSelect,
  onPlayToggle,
  onSettingsOpen,
  onViewFlip,
  selectedNote,
  selectedOctave,
  temperament,
}) {
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isOctavesModalOpen, setIsOctavesModalOpen] = useState(false);

  const handleNoteSelect = note => {
    onNoteSelect(note);
    setIsNotesModalOpen(false);
  };

  const handleOctaveSelect = octave => {
    onOctaveSelect(octave);
    setIsOctavesModalOpen(false);
  };

  let pitch =
    Math.round(10 * temperament.getPitch(selectedNote, selectedOctave)) / 10;

  return (
    <div className="PitchGenerator">
      <div className="PitchGenerator-controls">
        <Button
          fontSizeRem={5}
          isFocusable={isFocusable}
          label={Temperament.prettifyNoteName(selectedNote)}
          onClick={() => setIsNotesModalOpen(true)}
        />
        <Button
          fontSizeRem={5}
          isFocusable={isFocusable}
          label={String(selectedOctave)}
          onClick={() => setIsOctavesModalOpen(true)}
        />
      </div>
      <PlaybackControl
        isFocusable={isFocusable}
        isPlaying={isPlaying}
        onClick={onPlayToggle}
      />
      <span className="PitchGenerator-pitch">{`${pitch} Hz`}</span>
      <SettingsBar
        isFocusable={isFocusable}
        switchIcon={faMicrophone}
        onViewFlip={onViewFlip}
        onSettingsOpen={onSettingsOpen}
      />
      <Modal
        isOpen={isNotesModalOpen}
        onRequestClose={() => setIsNotesModalOpen(false)}
        title="Select note"
      >
        <div className="PitchGenerator-notes">
          {temperament.getNoteNames().map(note => (
            <Button
              key={note}
              fontSizeRem={5}
              isFocusable={true}
              isSelected={note === selectedNote}
              label={Temperament.prettifyNoteName(note)}
              onClick={() => handleNoteSelect(note)}
            />
          ))}
        </div>
      </Modal>
      <Modal
        isOpen={isOctavesModalOpen}
        onRequestClose={() => setIsOctavesModalOpen(false)}
        title="Select octave"
      >
        <div className="PitchGenerator-octaves">
          {temperament.getOctaveRange(2).map(octave => (
            <Button
              key={octave}
              fontSizeRem={5}
              isFocusable={true}
              isSelected={octave === selectedOctave}
              label={String(octave)}
              onClick={() => handleOctaveSelect(octave)}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}

PitchGenerator.propTypes = {
  isFocusable: PropTypes.bool,
  isPlaying: PropTypes.bool,
  onNoteSelect: PropTypes.func,
  onOctaveSelect: PropTypes.func,
  onPlayToggle: PropTypes.func,
  onSettingsOpen: PropTypes.func,
  onViewFlip: PropTypes.func,
  selectedNote: PropTypes.string,
  selectedOctave: PropTypes.number,
  temperament: PropTypes.instanceOf(Temperament),
};
