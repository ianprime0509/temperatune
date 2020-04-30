/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { useState, FC } from 'react';
import styled from 'styled-components/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMicrophone,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { Temperament, prettifyNoteName } from 'temperament';

import { Modal } from './Modal';
import { Button } from './Button';
import { Panel, PanelRow, PanelGroup } from './Panel';
import SettingsBar from './SettingsBar';

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const SpacedButton = styled(Button)`
  margin: 0.5rem;
  padding: 0.5rem;
`;

const NoteButton = styled(SpacedButton)`
  flex: 1 1 20%;
`;

const OctaveButton = styled(SpacedButton)`
  flex: 1 1 100%;
`;

const PitchDisplay = styled.div`
  font-size: 2rem;
  height: 2rem;
  margin: 1rem;
  min-height: 2rem;
  text-align: center;
  user-select: none;
`;

interface PlaybackControlProps {
  isPlaying: boolean;
  onClick?: () => void;
}

/** The playback control. */
const PlaybackControl: FC<PlaybackControlProps> = ({ isPlaying, onClick }) => (
  <Button
    isHoverable={false}
    onClick={onClick}
    onKeyPress={(e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        onClick && onClick();
      }
    }}
  >
    <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="7x" />
  </Button>
);

interface PitchGeneratorProps {
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

/** The panel containing the pitch generator interface. */
const PitchGenerator: FC<PitchGeneratorProps> = ({
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

  const pitch =
    Math.round(10 * temperament.getPitch(selectedNote, selectedOctave)) / 10;

  return (
    <>
      <Panel>
        <PanelRow>
          <SpacedButton
            fontSizeRem={5}
            onClick={() => setIsNotesModalOpen(true)}
          >
            {prettifyNoteName(selectedNote)}
          </SpacedButton>
          <SpacedButton
            fontSizeRem={5}
            onClick={() => setIsOctavesModalOpen(true)}
          >
            {selectedOctave}
          </SpacedButton>
        </PanelRow>
        <PanelGroup>
          <PlaybackControl isPlaying={isPlaying} onClick={onPlayToggle} />
          <PitchDisplay>{`${pitch} Hz`}</PitchDisplay>
        </PanelGroup>
        <SettingsBar
          switchIcon={faMicrophone}
          onViewFlip={onViewFlip}
          onSettingsOpen={onSettingsOpen}
        />
      </Panel>
      <Modal
        isOpen={isNotesModalOpen}
        title="Select note"
        onRequestClose={() => setIsNotesModalOpen(false)}
      >
        <ButtonGroup>
          {temperament.noteNames.map((note) => (
            <NoteButton
              key={note}
              fontSizeRem={5}
              isSelected={note === selectedNote}
              onClick={() => handleNoteSelect(note)}
            >
              {prettifyNoteName(note)}
            </NoteButton>
          ))}
        </ButtonGroup>
      </Modal>
      <Modal
        isOpen={isOctavesModalOpen}
        title="Select octave"
        onRequestClose={() => setIsOctavesModalOpen(false)}
      >
        <ButtonGroup>
          {temperament.getOctaveRange(2).map((octave) => (
            <OctaveButton
              key={octave}
              fontSizeRem={5}
              isSelected={octave === selectedOctave}
              onClick={() => handleOctaveSelect(octave)}
            >
              {octave}
            </OctaveButton>
          ))}
        </ButtonGroup>
      </Modal>
    </>
  );
};

export default PitchGenerator;
