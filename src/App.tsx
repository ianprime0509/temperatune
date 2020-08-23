import React, { useEffect, useRef, useState, FC } from "react";
import ReactModal from "react-modal";
import { useMediaQuery } from "react-responsive";
import styled, {
  ThemeProvider,
  createGlobalStyle,
} from "styled-components/macro";
import { Temperament } from "temperament";

import AppError from "./AppError";
import AppSettings from "./AppSettings";
import Background from "./Background";
import Flipper from "./Flipper";
import { useAlerts } from "./Modal";
import PitchAnalyser, {
  PERFECT_OFFSET,
  BAD_OFFSET,
  usePitchAnalyser,
} from "./PitchAnalyser";
import PitchGenerator, { usePitchGenerator } from "./PitchGenerator";
import { largeScreen, useDimensions } from "./media";
import { themes, useTheme } from "./theme";

import equalTemperament from "./temperaments/equal.json";
import quarterCommaMeantone from "./temperaments/quarterCommaMeantone.json";
import pythagoreanD from "./temperaments/pythagoreanD.json";

const builtInTemperaments = [
  new Temperament(equalTemperament),
  new Temperament(quarterCommaMeantone),
  new Temperament(pythagoreanD),
];

const GlobalStyle = createGlobalStyle`
  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  html {
    box-sizing: border-box;
  }

  body {
    background: ${({ theme }) => theme.backgroundColor};
    color: ${({ theme }) => theme.textColor};
    /*
     * Native font stack:
     * https://make.wordpress.org/core/2016/07/07/native-fonts-in-4-6/
     */
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
      Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
    height: 100%;
    left: 0;
    margin: 0;
    max-height: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    overflow-y: hidden;
    padding: 0;
    position: fixed;
    top: 0;
    user-select: none;
    width: 100vw;
  }

  a {
    color: ${({ theme }) => theme.linkColor};

    &:visited {
      color: ${({ theme }) => theme.linkVisitedColor};
    }
  }

  p {
    user-select: text;
  }

  #root {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    width: 100%;
  }
`;

/**
 * Get a wobbliness value from the given pitch offset.  Bigger offsets produce
 * more wobbliness.
 */
const getWobbliness = (offset: number): number => {
  const MAX = 20; // The maximum wobbliness

  let abs = Math.abs(offset);
  if (abs > BAD_OFFSET) {
    return MAX;
  } else if (abs > PERFECT_OFFSET) {
    const a = MAX / (BAD_OFFSET - PERFECT_OFFSET);
    return a * (abs - PERFECT_OFFSET);
  } else {
    return 0;
  }
};

const AppContainer = styled(Flipper)`
  height: 100%;
  width: 100%;

  @media ${largeScreen} {
    max-height: 25rem;
    max-width: 20rem;
  }
`;

const audioContext = new AudioContext();

/** The main application. */
const App: FC = () => {
  useEffect(() => ReactModal.setAppElement("#root"), []);

  const appRef = useRef<HTMLDivElement | null>(null);
  const { width: appWidth, height: appHeight } = useDimensions(appRef);
  const [isFlipped, setFlipped] = useState(false);
  const [areSettingsOpen, setSettingsOpen] = useState(false);

  const { alerts, addAlert } = useAlerts();
  const handleError = (err: any) => {
    if (err instanceof AppError) {
      addAlert({
        title: "Error",
        description: err.message,
        details: err.details,
      });
    } else {
      addAlert({
        title: "Error",
        description: "An unexpected error occurred.",
        details: String(err),
      });
    }
  };

  const [theme, setTheme] = useTheme();

  const [temperaments, setTemperaments] = useState(builtInTemperaments);
  const [selectedTemperament, setSelectedTemperament] = useState(
    temperaments[0]
  );
  const [selectedNote, setSelectedNote] = useState(
    selectedTemperament.referenceName
  );
  const [selectedOctave, setSelectedOctave] = useState(
    selectedTemperament.referenceOctave
  );
  const handleTemperamentSelect = (temperament: Temperament) => {
    setSelectedTemperament(temperament);
    const note =
      temperament.noteNames.find((note) => note === selectedNote) ??
      temperament.referenceName;
    setSelectedNote(note);
    generator.setPitch(temperament.getPitch(note, selectedOctave));
  };
  const handleTemperamentAdd = (temperament: Temperament) => {
    // We aren't allowed to have a temperament with the same name as some other
    // temperament or it would cause confusion
    const sameName = (t: Temperament) => t.name === temperament.name;
    if (temperaments.some(sameName)) {
      addAlert({
        title: "Error",
        description: `A temperament with the name '${temperament.name}' already exists.`,
      });
      return;
    }
    setTemperaments([...temperaments, temperament]);

    handleTemperamentSelect(temperament);
  };

  const generator = usePitchGenerator(
    audioContext,
    selectedTemperament.getPitch(selectedNote, selectedOctave)
  );
  const analyser = usePitchAnalyser(audioContext, (err) =>
    addAlert({
      title: "Error",
      description: "Could not get audio input.",
      details: String(err),
    })
  );
  const [detectedNote, detectedOffset] =
    analyser.detectedPitch !== null
      ? selectedTemperament.getNoteNameFromPitch(analyser.detectedPitch)
      : ["", 0];

  const flip = () => {
    if (isFlipped) {
      analyser.stop();
      setFlipped(false);
    } else {
      generator.stop();
      analyser.listen();
      setFlipped(true);
    }
  };

  const isBackgroundActive =
    generator.isPlaying || (isFlipped && detectedNote !== "");
  const wobbliness =
    isFlipped && detectedNote ? getWobbliness(detectedOffset) : 0;

  const isLargeScreen = useMediaQuery({ query: largeScreen });

  return (
    // Using a variant of https://davidwalsh.name/css-flip for the flip
    // animation
    <ThemeProvider theme={theme.theme}>
      <GlobalStyle />
      {isLargeScreen && (
        <Background
          appHeight={appHeight}
          appWidth={appWidth}
          isActive={isBackgroundActive}
          wobbliness={wobbliness}
        />
      )}
      <AppContainer
        ref={appRef}
        isFlipped={isFlipped}
        front={
          <PitchGenerator
            isPlaying={generator.isPlaying}
            onNoteSelect={(note) => {
              setSelectedNote(note);
              generator.setPitch(
                selectedTemperament.getPitch(note, selectedOctave)
              );
            }}
            onOctaveSelect={(octave) => {
              setSelectedOctave(octave);
              generator.setPitch(
                selectedTemperament.getPitch(selectedNote, octave)
              );
            }}
            onPlayToggle={() => generator.togglePlay()}
            onSettingsOpen={() => setSettingsOpen(true)}
            onViewFlip={flip}
            selectedNote={selectedNote}
            selectedOctave={selectedOctave}
            temperament={selectedTemperament}
          />
        }
        back={
          <PitchAnalyser
            detectedNote={detectedNote}
            detectedOffset={detectedOffset}
            onSettingsOpen={() => setSettingsOpen(true)}
            onViewFlip={flip}
          />
        }
      />
      <AppSettings
        isOpen={areSettingsOpen}
        selectedTemperament={selectedTemperament}
        selectedTheme={theme}
        temperaments={temperaments}
        themes={themes}
        onClose={() => setSettingsOpen(false)}
        onError={handleError}
        onTemperamentAdd={handleTemperamentAdd}
        onTemperamentSelect={handleTemperamentSelect}
        onThemeSelect={setTheme}
      />
      {alerts}
    </ThemeProvider>
  );
};

export default App;
