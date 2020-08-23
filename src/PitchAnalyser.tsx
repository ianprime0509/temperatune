import React, { useRef, useState, FC } from "react";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { PitchDetector } from "pitchy";
import styled from "styled-components/macro";

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
  min-height: 13rem;
  text-align: center;
  vertical-align: middle;
`;

const OffsetDisplay = styled.div`
  font-size: 2rem;
  min-height: 3rem;
  text-align: center;
  vertical-align: middle;
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

const obtainMicrophoneSource = async (
  audioContext: AudioContext
): Promise<MediaStreamAudioSourceNode> => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return audioContext.createMediaStreamSource(stream);
};

/** A hook to manage pitch detection using an {@link AudioContext}. */
export const usePitchAnalyser = (
  audioContext: AudioContext,
  onMicrophoneAccessError?: (error: unknown) => void
): {
  detectedPitch: number | null;
  listen: () => Promise<void>;
  stop: () => void;
} => {
  const analyser = useRef<AnalyserNode>(audioContext.createAnalyser());
  const buffer = useRef<Float32Array>(
    new Float32Array(analyser.current.fftSize)
  );
  const detector = useRef<PitchDetector<Float32Array>>(
    PitchDetector.forFloat32Array(buffer.current.length)
  );
  const microphoneSource = useRef<MediaStreamAudioSourceNode | null>(null);
  const updateInterval = useRef<number | null>(null);
  const [detectedPitch, setDetectedPitch] = useState<number | null>(null);

  const update = () => {
    analyser.current.getFloatTimeDomainData(buffer.current);
    const [pitch, clarity] = detector.current.findPitch(
      buffer.current,
      audioContext.sampleRate
    );
    setDetectedPitch(clarity >= 0.8 ? pitch : null);
  };

  const listen = async () => {
    if (!microphoneSource.current) {
      try {
        microphoneSource.current = await obtainMicrophoneSource(audioContext);
      } catch (e) {
        onMicrophoneAccessError && onMicrophoneAccessError(e);
        return;
      }
    }

    microphoneSource.current.connect(analyser.current);
    audioContext.resume();
    if (updateInterval.current !== null) {
      window.clearInterval(updateInterval.current);
    }
    updateInterval.current = window.setInterval(update, 150);
  };

  const stop = () => {
    if (!microphoneSource.current) return;

    if (updateInterval.current !== null) {
      window.clearInterval(updateInterval.current);
      updateInterval.current = null;
    }
    microphoneSource.current.disconnect(analyser.current);
    // By stopping the microphone source tracks, we signal to the browser that
    // we won't be using the microphone until later (this seems to have an
    // impact on the volume type chosen for Android)
    microphoneSource.current.mediaStream
      .getTracks()
      .forEach((track) => track.stop());
    microphoneSource.current = null;

    // If we don't recreate the analyser for each new connection, then for some
    // reason trying to reconnect to it doesn't work
    analyser.current = audioContext.createAnalyser();
    buffer.current = new Float32Array(analyser.current.fftSize);
    detector.current = PitchDetector.forFloat32Array(buffer.current.length);
  };

  return { detectedPitch, listen, stop };
};
