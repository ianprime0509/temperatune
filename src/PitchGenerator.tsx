import React, { useRef, useState, FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { Temperament } from "temperament";

import { Modal } from "./Modal";
import { Button, ButtonGroup } from "./Button";
import { Panel, PanelGroup } from "./Panel";
import SettingsBar from "./SettingsBar";
import TextBlock from "./TextBlock";

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
          <Button
            data-testid="generator-selected-note"
            fontSize="x-large"
            onClick={() => setIsNotesModalOpen(true)}
          >
            {selectedNote}
          </Button>
          <Button
            data-testid="generator-selected-octave"
            fontSize="x-large"
            onClick={() => setIsOctavesModalOpen(true)}
          >
            {selectedOctave}
          </Button>
        </PanelGroup>
        <PanelGroup forceDirection={true} grow={1} spaceBetween={false}>
          <Button
            isHoverable={false}
            fontSize="xx-large"
            onClick={onPlayToggle}
          >
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </Button>
          <TextBlock
            data-testid="generator-pitch-display"
            fontSize="large"
            selectable={false}
          >{`${pitch} Hz`}</TextBlock>
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
        <ButtonGroup data-testid="generator-note-select">
          {temperament.noteNames.map((note) => (
            <Button
              ref={(ref: HTMLButtonElement) => {
                if (note === selectedNote) selectedNoteRef.current = ref;
              }}
              key={note}
              fontSize="x-large"
              isSelected={note === selectedNote}
              onClick={() => handleNoteSelect(note)}
            >
              {note}
            </Button>
          ))}
        </ButtonGroup>
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
        <ButtonGroup data-testid="generator-octave-select" columns={1}>
          {temperament.getOctaveRange(2).map((octave) => (
            <Button
              ref={(ref: HTMLButtonElement) => {
                if (octave === selectedOctave) selectedOctaveRef.current = ref;
              }}
              key={octave}
              fontSize="x-large"
              isSelected={octave === selectedOctave}
              onClick={() => handleOctaveSelect(octave)}
            >
              {octave}
            </Button>
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
