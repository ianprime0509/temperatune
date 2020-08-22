import React, { FC } from "react";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components/macro";
import { Temperament } from "temperament";

import { Panel, PanelGroup } from "./Panel";
import SettingsBar from "./SettingsBar";

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
    return "In tune";
  }

  let flatOrSharp = offset < 0 ? "Flat" : "Sharp";
  // I'm trusting that PERFECT_OFFSET will always be bigger than 1, so we don't
  // have to worry about 'cents' vs 'cent'.
  return flatOrSharp + ` by ${Math.round(Math.abs(offset))} cents`;
};

interface PitchAnalyserPanelProps {
  detectedNote: string;
  detectedOffset: number;
}

const PitchAnalyserPanel = styled(Panel)<PitchAnalyserPanelProps>`
  background: ${({ detectedNote, detectedOffset, theme }) =>
    detectedNote
      ? `hsl(${getHue(detectedOffset)}, 70%, ${theme.tuneBackgroundLuminosity})`
      : theme.panelBackgroundColor};
`;

const NoteDisplay = styled.div`
  font-size: 10rem;
  min-height: 11rem;
  text-align: center;
`;

const OffsetDisplay = styled.div`
  font-size: 2rem;
  min-height: 3rem;
  text-align: center;
`;

interface PitchAnalyserProps {
  detectedNote: string;
  detectedOffset: number;

  onSettingsOpen?: () => void;
  onViewFlip?: () => void;
}

/**
 * The component handling the "pitch detection" panel of the tuner.
 */
const PitchAnalyser: FC<PitchAnalyserProps> = ({
  detectedNote,
  detectedOffset,
  onSettingsOpen,
  onViewFlip,
}) => (
  <PitchAnalyserPanel
    detectedNote={detectedNote}
    detectedOffset={detectedOffset}
  >
    <PanelGroup forceDirection={true} grow={1} spaceBetween={false}>
      <NoteDisplay data-testid="analyser-note-display">
        {detectedNote ? detectedNote : "-"}
      </NoteDisplay>
      <OffsetDisplay data-testid="analyser-offset-display">
        {detectedNote ? getOffsetString(detectedOffset) : ""}
      </OffsetDisplay>
    </PanelGroup>
    <SettingsBar
      switchIcon={faMusic}
      onSettingsOpen={onSettingsOpen}
      onViewFlip={onViewFlip}
    />
  </PitchAnalyserPanel>
);

export default PitchAnalyser;
