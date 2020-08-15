/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
import React, { FC } from "react";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components/macro";
import { Temperament } from "temperament";

import { Panel } from "./Panel";
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

const NoteDisplayContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1 1;
  justify-content: center;
  min-height: 11rem;
`;

const NoteDisplay = styled.div`
  font-size: 10rem;
`;

const OffsetDisplayContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: 3rem;
  padding: 1rem 0;
`;

const OffsetDisplay = styled.div`
  font-size: 2rem;
`;

interface PitchAnalyserProps {
  detectedNote: string;
  detectedOffset: number;
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
  onSettingsOpen,
  onViewFlip,
}) => (
  <PitchAnalyserPanel
    detectedNote={detectedNote}
    detectedOffset={detectedOffset}
  >
    <NoteDisplayContainer>
      <NoteDisplay>{detectedNote ? detectedNote : "-"}</NoteDisplay>
    </NoteDisplayContainer>
    <OffsetDisplayContainer>
      <OffsetDisplay>
        {detectedNote ? getOffsetString(detectedOffset) : ""}
      </OffsetDisplay>
    </OffsetDisplayContainer>
    <SettingsBar
      switchIcon={faMusic}
      onSettingsOpen={onSettingsOpen}
      onViewFlip={onViewFlip}
    />
  </PitchAnalyserPanel>
);

export default PitchAnalyser;
