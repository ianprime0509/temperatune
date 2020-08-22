import React, { Component } from "react";
import ReactModal from "react-modal";
import { PitchDetector } from "pitchy";
import styled, {
  ThemeProvider,
  createGlobalStyle,
} from "styled-components/macro";
import { Temperament } from "temperament";

import AppError from "./AppError";
import AppSettings from "./AppSettings";
import Background from "./Background";
import Flipper from "./Flipper";
import { Alert } from "./Modal";
import PitchAnalyser, { PERFECT_OFFSET, BAD_OFFSET } from "./PitchAnalyser";
import PitchGenerator from "./PitchGenerator";
import { largeScreen } from "./media";
import { themes, Theme } from "./theme";

import equalTemperament from "./temperaments/equal.json";
import quarterCommaMeantone from "./temperaments/quarterCommaMeantone.json";
import pythagoreanD from "./temperaments/pythagoreanD.json";

const THEME_STORAGE_KEY = "selectedTheme";

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

interface AppAlert {
  title: string;
  description: string;
  details?: string;
  isOpen: boolean;
}

interface AppState {
  alerts: AppAlert[];
  appHeight: number;
  appWidth: number;
  detectedNote: string;
  detectedOffset: number;
  isFlipped: boolean;
  isPlaying: boolean;
  areSettingsOpen: boolean;
  selectedTemperament: Temperament;
  temperaments: Temperament[];
  selectedNote: string;
  selectedOctave: number;
  selectedTheme: Theme;
}

/** The main application. */
export default class App extends Component<{}, AppState> {
  private app: HTMLDivElement | null;
  private audioContext: AudioContext;
  private analyser: AnalyserNode | null;
  private analyserBuffer: Float32Array | null;
  private pitchDetector: PitchDetector<Float32Array> | null;
  private oscillator: OscillatorNode;
  private microphoneSource: MediaStreamAudioSourceNode | null;
  private inputNoteInterval: number | null;

  constructor(props: {}) {
    super(props);
    const equal = new Temperament(equalTemperament);
    this.state = {
      /**
       * The stack of alert messages currently being shown.  Each alert is an
       * object with keys `title`, `description` and `isOpen`.  Optionally, the
       * `details` property can provide more information that isn't
       * automatically shown to the user.
       */
      alerts: [],
      appHeight: 0,
      appWidth: 0,
      /** The current detected note. */
      detectedNote: "",
      /** The offset of the current pitch from the detected note. */
      detectedOffset: 0,
      /** Whether the back panel is being shown. */
      isFlipped: false,
      /** Whether the tone is being played in the pitch generator. */
      isPlaying: false,
      areSettingsOpen: false,
      selectedTemperament: equal,
      /** The installed temperaments. */
      temperaments: [
        equal,
        new Temperament(quarterCommaMeantone),
        new Temperament(pythagoreanD),
      ],
      selectedNote: equal.referenceName,
      selectedOctave: equal.referenceOctave,
      selectedTheme:
        themes.find(
          (theme) =>
            theme.name === window.localStorage.getItem(THEME_STORAGE_KEY)
        ) ?? themes[0],
    };

    this.app = null;
    this.audioContext = new AudioContext();
    this.analyser = null;
    this.analyserBuffer = null;
    this.pitchDetector = null;
    this.oscillator = this.audioContext.createOscillator();
    this.oscillator.start();
    this.microphoneSource = null;
    this.inputNoteInterval = null;

    ReactModal.setAppElement("#root");
  }

  componentDidMount() {
    // Handle the resize once at the beginning to get the initial size
    this.handleResize();
    window.addEventListener("resize", () => this.handleResize());
  }

  render() {
    let isBackgroundActive =
      this.state.isPlaying ||
      (this.state.isFlipped && this.state.detectedNote !== null);
    let wobbliness =
      this.state.isFlipped && this.state.detectedNote
        ? getWobbliness(this.state.detectedOffset)
        : 0;

    return (
      // Using a variant of https://davidwalsh.name/css-flip for the flip
      // animation
      <ThemeProvider theme={this.state.selectedTheme.theme}>
        <GlobalStyle />
        <Background
          appHeight={this.state.appHeight}
          appWidth={this.state.appWidth}
          isActive={isBackgroundActive}
          wobbliness={wobbliness}
        />
        <AppContainer
          ref={(ref) => (this.app = ref)}
          isFlipped={this.state.isFlipped}
          front={
            <PitchGenerator
              isPlaying={this.state.isPlaying}
              onNoteSelect={(note) => this.handleNoteSelect(note)}
              onOctaveSelect={(octave) => this.handleOctaveSelect(octave)}
              onPlayToggle={() => this.handlePlayToggle()}
              onSettingsOpen={() => this.handleSettingsOpen()}
              onViewFlip={() => this.handleViewFlip()}
              selectedNote={this.state.selectedNote}
              selectedOctave={this.state.selectedOctave}
              temperament={this.state.selectedTemperament}
            />
          }
          back={
            <PitchAnalyser
              detectedNote={this.state.detectedNote}
              detectedOffset={this.state.detectedOffset}
              onSettingsOpen={() => this.handleSettingsOpen()}
              onViewFlip={() => this.handleViewFlip()}
              temperament={this.state.selectedTemperament}
            />
          }
        />
        <AppSettings
          isOpen={this.state.areSettingsOpen}
          selectedTemperament={this.state.selectedTemperament}
          selectedTheme={this.state.selectedTheme}
          temperaments={this.state.temperaments}
          themes={themes}
          onClose={() => this.handleSettingsClose()}
          onError={(e) => this.handleError(e)}
          onTemperamentAdd={(temperament) =>
            this.handleTemperamentAdd(temperament)
          }
          onTemperamentSelect={(temperament) =>
            this.handleTemperamentSelect(temperament)
          }
          onThemeSelect={(theme) => this.handleThemeSelect(theme)}
        />
        {this.state.alerts.map((alert, i) => (
          <Alert
            key={i}
            description={alert.description}
            details={alert.details}
            handleAlertClose={() => this.handleAlertClose()}
            isOpen={alert.isOpen}
            title={alert.title}
          />
        ))}
      </ThemeProvider>
    );
  }

  /** Close the alert on the top of the stack. */
  private handleAlertClose() {
    this.setState((state) => {
      // Actually, all we do is set the `isOpen` property of the top-most alert
      // to `false` so that its close animation can play.  The closed alerts
      // will be cleaned up when the next alert is opened.
      let alerts = state.alerts.slice();
      alerts[alerts.length - 1].isOpen = false;
      return { alerts };
    });
  }

  private handleAlertOpen(
    title: string,
    description: string,
    details?: string
  ) {
    this.setState((state) => {
      // We also clean up any alerts that have been closed already.
      let alerts = state.alerts.filter((alert) => alert.isOpen);
      return {
        alerts: alerts.concat([{ title, description, details, isOpen: true }]),
      };
    });
  }

  private handleError(error: Error) {
    if (error instanceof AppError) {
      this.handleAlertOpen("Error", error.message, error.details);
    } else {
      this.handleAlertOpen(
        "Error",
        "An unexpected error occurred.",
        error.toString()
      );
    }
  }

  private handleNoteSelect(note: string) {
    this.setState({ selectedNote: note }, () => this.soundUpdate());
  }

  private handleOctaveSelect(octave: number) {
    this.setState({ selectedOctave: octave }, () => this.soundUpdate());
  }

  private handlePlayToggle() {
    this.setState((state) => {
      if (state.isPlaying) {
        this.soundStop();
      } else {
        this.soundPlay();
      }

      return {
        isPlaying: !state.isPlaying,
      };
    });
  }

  /** Handle the window (viewport) resizing to update the canvas background. */
  private handleResize() {
    if (!this.app) return;

    let appBounds = this.app.getBoundingClientRect();
    this.setState({
      appHeight: appBounds.height,
      appWidth: appBounds.width,
    });
  }

  private handleSettingsClose() {
    this.setState({ areSettingsOpen: false });
  }

  private handleSettingsOpen() {
    this.setState({ areSettingsOpen: true });
  }

  private handleTemperamentAdd(temperament: Temperament) {
    // We aren't allowed to have a temperament with the same name as some
    // other temperament, or it would cause confusion.
    let sameName = (t: Temperament) => t.name === temperament.name;
    if (this.state.temperaments.some(sameName)) {
      this.handleAlertOpen(
        "Error",
        `A temperament with the name '${temperament.name}' already exists.`
      );
      return;
    }

    this.setState(
      (state) => ({ temperaments: [...state.temperaments, temperament] }),
      () => this.handleTemperamentSelect(temperament)
    );
  }

  private handleTemperamentSelect(temperament: Temperament) {
    this.setState(
      (state) => ({
        selectedTemperament: temperament,
        // Reuse the current selected note (if possible) and octave
        selectedNote: temperament.noteNames.some(
          (note) => note === state.selectedNote
        )
          ? state.selectedNote
          : temperament.referenceName,
      }),
      () => this.soundUpdate()
    );
  }

  private handleThemeSelect(theme: Theme) {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme.name);
    this.setState({ selectedTheme: theme });
  }

  private handleViewFlip() {
    this.setState(({ isFlipped, isPlaying }) => {
      if (isFlipped) {
        this.audioContext.suspend();
        if (this.inputNoteInterval !== null) {
          // We don't need to be updating the microphone input note if the
          // analyser view isn't open.
          window.clearInterval(this.inputNoteInterval);
          this.inputNoteInterval = null;
          if (this.microphoneSource) {
            this.analyser && this.microphoneSource.disconnect(this.analyser);
            // By stopping the microphone source tracks, we signal to the browser
            // that we won't be using the microphone until later (this seems to
            // have an impact on the volume type chosen for Android)
            this.microphoneSource.mediaStream
              .getTracks()
              .forEach((track) => track.stop());
          }
        }
        return { isFlipped: false, isPlaying: false };
      } else {
        // We don't want the tuning note to keep playing when we switch over to
        // analyser mode.
        if (isPlaying) {
          this.soundStop();
        }
        // Try to obtain the microphone source and start updating the input
        // note.
        this.microphoneSourceObtain()
          .then((microphoneSource) => {
            this.microphoneSource = microphoneSource;
            this.analyser = this.audioContext.createAnalyser();
            this.analyserBuffer = new Float32Array(this.analyser.fftSize);
            this.pitchDetector = PitchDetector.forFloat32Array(
              this.analyserBuffer.length
            );
            this.microphoneSource.connect(this.analyser);
            this.audioContext.resume();
            this.inputNoteInterval = window.setInterval(
              () => this.inputNoteUpdate(),
              100
            );
          })
          .catch((err) =>
            this.handleAlertOpen(
              "Error",
              "Could not get audio input.",
              String(err)
            )
          );
        return { isFlipped: true, isPlaying: false };
      }
    });
  }

  /** Update the input note from the microphone input. */
  private inputNoteUpdate() {
    if (!this.analyser || !this.analyserBuffer || !this.pitchDetector) return;

    this.analyser.getFloatTimeDomainData(this.analyserBuffer);
    let [pitch, clarity] = this.pitchDetector.findPitch(
      this.analyserBuffer,
      this.audioContext.sampleRate
    );
    if (clarity < 0.8) {
      this.setState({ detectedNote: "", detectedOffset: 0 });
      return;
    }
    let [note, offset] = this.state.selectedTemperament.getNoteNameFromPitch(
      pitch
    );

    this.setState({ detectedNote: note, detectedOffset: offset });
  }

  /** Attempt to get microphone access and set up the source node. */
  private async microphoneSourceObtain(): Promise<MediaStreamAudioSourceNode> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return this.audioContext.createMediaStreamSource(stream);
  }

  /** Begin playing the tuning pitch. */
  private soundPlay() {
    this.soundUpdate();
    this.oscillator.connect(this.audioContext.destination);
    this.audioContext.resume();
  }

  /** Stop playing the tuning pitch. */
  private soundStop() {
    this.audioContext.suspend();
    this.oscillator.disconnect(this.audioContext.destination);
  }

  /** Update the frequency of the tuning pitch. */
  private soundUpdate() {
    let pitch = this.state.selectedTemperament.getPitch(
      this.state.selectedNote,
      this.state.selectedOctave
    );
    this.oscillator.frequency.setValueAtTime(
      pitch,
      this.audioContext.currentTime
    );
  }
}
