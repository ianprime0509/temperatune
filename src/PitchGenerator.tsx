import React, { useRef, useState, FC } from "react";
import styled from "styled-components/macro";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { Temperament } from "temperament";

import { Modal } from "./Modal";
import { Button } from "./Button";
import { Panel, PanelGroup } from "./Panel";
import SettingsBar from "./SettingsBar";

const SpacedButton = styled(Button)`
  margin: 0.5rem;
  padding: 0.5rem;
`;

const ButtonGroup = styled.div`
  display: grid;
  justify-items: center;

  ${Button} {
    width: 100%;
  }
`;

const GridButtonGroup = styled(ButtonGroup)`
  @media (min-width: 400px) {
    grid-template-columns: repeat(2, 1fr);
    max-width: 400px;
  }

  @media (min-width: 600px) {
    grid-template-columns: repeat(3, 1fr);
    max-width: 600px;
  }

  @media (min-width: 800px) {
    grid-template-columns: repeat(4, 1fr);
    max-width: 800px;
  }
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
  <Button isHoverable={false} onClick={onClick}>
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
  const selectedNoteRef = useRef<HTMLButtonElement | null>(null);
  const selectedOctaveRef = useRef<HTMLButtonElement | null>(null);

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
        <PanelGroup direction="row">
          <SpacedButton
            data-testid="generator-selected-note"
            fontSizeRem={5}
            onClick={() => setIsNotesModalOpen(true)}
          >
            {selectedNote}
          </SpacedButton>
          <SpacedButton
            data-testid="generator-selected-octave"
            fontSizeRem={5}
            onClick={() => setIsOctavesModalOpen(true)}
          >
            {selectedOctave}
          </SpacedButton>
        </PanelGroup>
        <PanelGroup forceDirection={true} spaceBetween={false}>
          <PlaybackControl isPlaying={isPlaying} onClick={onPlayToggle} />
          <PitchDisplay data-testid="generator-pitch-display">{`${pitch} Hz`}</PitchDisplay>
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
        onAfterOpen={() =>
          selectedNoteRef.current && selectedNoteRef.current.scrollIntoView()
        }
        onRequestClose={() => setIsNotesModalOpen(false)}
      >
        <GridButtonGroup data-testid="generator-note-select">
          {temperament.noteNames.map((note) => (
            <SpacedButton
              ref={(ref: HTMLButtonElement) => {
                if (note === selectedNote) selectedNoteRef.current = ref;
              }}
              key={note}
              fontSizeRem={4}
              isSelected={note === selectedNote}
              onClick={() => handleNoteSelect(note)}
            >
              {note}
            </SpacedButton>
          ))}
        </GridButtonGroup>
      </Modal>
      <Modal
        isOpen={isOctavesModalOpen}
        title="Select octave"
        onAfterOpen={() =>
          selectedOctaveRef.current &&
          selectedOctaveRef.current.scrollIntoView()
        }
        onRequestClose={() => setIsOctavesModalOpen(false)}
      >
        <ButtonGroup data-testid="generator-octave-select">
          {temperament.getOctaveRange(2).map((octave) => (
            <SpacedButton
              ref={(ref: HTMLButtonElement) => {
                if (octave === selectedOctave) selectedOctaveRef.current = ref;
              }}
              key={octave}
              fontSizeRem={4}
              isSelected={octave === selectedOctave}
              onClick={() => handleOctaveSelect(octave)}
            >
              {octave}
            </SpacedButton>
          ))}
        </ButtonGroup>
      </Modal>
    </>
  );
};

export default PitchGenerator;

/** A hook to manage pitch playback using an {@link AudioContext}. */
export const usePitchGenerator = (
  audioContext: AudioContext,
  initialPitch: number
): {
  isPlaying: boolean;
  setPitch: (pitch: number) => void;
  play: () => void;
  stop: () => void;
  togglePlay: () => void;
} => {
  const oscillator = useRef<OscillatorNode | null>(null);
  const [pitch, setPitch] = useState(initialPitch);
  const [isPlaying, setPlaying] = useState(false);

  const updatePitch = (pitch: number) => {
    if (!oscillator.current) return;

    oscillator.current.frequency.setValueAtTime(
      pitch,
      audioContext.currentTime
    );
  };
  const play = () => {
    if (!oscillator.current) {
      oscillator.current = audioContext.createOscillator();
      oscillator.current.start();
    }
    if (!isPlaying) {
      oscillator.current.connect(audioContext.destination);
      audioContext.resume();
      setPlaying(true);
    }
    updatePitch(pitch);
  };
  const stop = () => {
    if (oscillator.current && isPlaying) {
      audioContext.suspend();
      oscillator.current.disconnect(audioContext.destination);
      setPlaying(false);
    }
  };

  return {
    isPlaying,
    setPitch: (pitch: number) => {
      setPitch(pitch);
      updatePitch(pitch);
    },
    play,
    stop,
    togglePlay: () => {
      if (isPlaying) {
        stop();
      } else {
        play();
      }
    },
  };
};
