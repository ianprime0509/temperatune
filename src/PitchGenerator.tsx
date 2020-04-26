/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { useState, FC } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { Temperament, prettifyNoteName } from 'temperament';

import { Modal } from './Modal';
import Button from './Button';
import SettingsBar from './SettingsBar';

import './PitchGenerator.css';

interface PlaybackControlProps {
  isFocusable?: boolean;
  isPlaying: boolean;
  onClick?: () => void;

  [k: string]: any;
}

/** The playback control. */
const PlaybackControl: FC<PlaybackControlProps> = ({
  isFocusable,
  isPlaying,
  onClick,
  ...rest
}) => {
  const icon = isPlaying ? faPause : faPlay;
  return (
    <div className="PlaybackControl">
      <FontAwesomeIcon
        icon={icon}
        className="PlaybackControl-icon"
        onClick={onClick}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick && onClick();
          }
        }}
        tabIndex={isFocusable ? 0 : -1}
        {...rest}
      />
    </div>
  );
};

interface PitchGeneratorProps {
  isFocusable: boolean;
  isPlaying: boolean;
  selectedNote: string;
  selectedOctave: number;
  temperament: Temperament;

  onNoteSelect?: (note: string) => void;
  onOctaveSelect?: (octave: number) => void;
  onPlayToggle?: () => void;
  onSettingsOpen?: () => void;
  onViewFlip?: () => void;
}

/** The "panel" containing the pitch generator interface. */
const PitchGenerator: FC<PitchGeneratorProps> = ({
  isFocusable,
  isPlaying,
  selectedNote,
  selectedOctave,
  temperament,
  onNoteSelect,
  onOctaveSelect,
  onPlayToggle,
  onSettingsOpen,
  onViewFlip,
}) => {
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isOctavesModalOpen, setIsOctavesModalOpen] = useState(false);

  const handleNoteSelect = (note: string) => {
    onNoteSelect && onNoteSelect(note);
    setIsNotesModalOpen(false);
  };

  const handleOctaveSelect = (octave: number) => {
    onOctaveSelect && onOctaveSelect(octave);
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
          label={prettifyNoteName(selectedNote)}
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
        title="Select note"
        onRequestClose={() => setIsNotesModalOpen(false)}
      >
        <div className="PitchGenerator-notes">
          {temperament.noteNames.map((note) => (
            <Button
              key={note}
              fontSizeRem={5}
              isFocusable={true}
              isSelected={note === selectedNote}
              label={prettifyNoteName(note)}
              onClick={() => handleNoteSelect(note)}
            />
          ))}
        </div>
      </Modal>
      <Modal
        isOpen={isOctavesModalOpen}
        title="Select octave"
        onRequestClose={() => setIsOctavesModalOpen(false)}
      >
        <div className="PitchGenerator-octaves">
          {temperament.getOctaveRange(2).map((octave) => (
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
};

export default PitchGenerator;
