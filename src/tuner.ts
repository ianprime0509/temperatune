import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { PitchAnalyser, PitchUpdateEvent } from "./pitch-analyser";
import { PitchGenerator } from "./pitch-generator.js";
import { temperamentManager } from "./settings/temperament.js";
import "./ui/button.js";
import "./feedback.js";
import "./ui/item-carousel.js";
import { ItemCarousel, ItemSelectEvent } from "./ui/item-carousel.js";
import { commonStyles } from "./style.js";

const OCTAVE_RADIUS = 2;

const audioContext = new AudioContext();

@customElement("tt-tuner")
export class Tuner extends LitElement {
  static override styles = [
    commonStyles,
    css`
      :host {
        display: block;
      }

      main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        width: 100%;
        height: 100%;
      }

      .material-icons-round {
        color: var(--color-text);
      }

      #notes {
        width: 100%;
        height: 100%;
        max-height: 40%;
      }

      #octaves {
        width: 100%;
        height: 100%;
        max-height: 20%;
      }

      #feedback {
        height: 20%;
        max-height: 20%;
      }

      #play-button > .material-icons-round {
        font-size: 8rem;
      }
    `,
  ];

  @state() private _playing = false;
  @state() private _pitch =
    temperamentManager.selectedTemperament.referencePitch;
  @state() private _centOffset = 0;
  private _notes = createRef<ItemCarousel>();
  private _octaves = createRef<ItemCarousel>();
  private _pitchAnalyser = new PitchAnalyser(audioContext);
  private _pitchGenerator = new PitchGenerator(audioContext);

  constructor() {
    super();

    temperamentManager.addEventListener("temperament-select", () => {
      this._resetPitch();
      this.requestUpdate();
    });
    this._pitchAnalyser.addEventListener("pitch-update", (e) =>
      this._handlePitchUpdate(e as PitchUpdateEvent)
    );
  }

  override render() {
    return html`<link
        href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
        rel="stylesheet"
      />
      <main>
        <tt-item-carousel
          id="notes"
          label="Note"
          ?disabled=${!this._playing}
          .items=${temperamentManager.selectedTemperament.noteNames}
          @item-select=${this._handleNoteItemSelect}
          ${ref(this._notes)}
        ></tt-item-carousel>

        ${this._playing
          ? html`<tt-item-carousel
              id="octaves"
              label="Octave"
              .items=${temperamentManager.selectedTemperament.getOctaveRange(
                OCTAVE_RADIUS
              )}
              itemHeight="50"
              min="0"
              max="4"
              @item-select=${this._handleOctaveItemSelect}
              ${ref(this._octaves)}
            ></tt-item-carousel>`
          : html`<tt-feedback
              id="feedback"
              centOffset=${this._centOffset}
              pitch=${this._pitch}
            ></tt-feedback>`}

        <tt-button
          pulse
          round
          id="play-button"
          @click=${() => (this._playing = !this._playing)}
        >
          <span class="material-icons-round"
            >${this._playing ? "mic" : "play_arrow"}</span
          >
        </tt-button>
      </main>`;
  }

  override updated(changedProperties: PropertyValues) {
    if (changedProperties.has("_playing")) {
      this._resetPitch();
      if (this._playing) {
        this._pitchAnalyser.stop();
        this._pitchGenerator.play();
      } else {
        this._pitchGenerator.pause();
        this._pitchAnalyser.listen();
      }
    }
  }

  private _handleNoteItemSelect(event: ItemSelectEvent) {
    this._updateGeneratedPitch(event.item, this._octaves.value!.selected);
  }

  private _handleOctaveItemSelect(event: ItemSelectEvent) {
    this._updateGeneratedPitch(this._notes.value!.selected, event.item);
  }

  private _handlePitchUpdate(event: PitchUpdateEvent) {
    if (event.clarity < 0.9) return;

    this._pitch = event.pitch;
    const [noteName, centOffset] =
      temperamentManager.selectedTemperament.getNoteNameFromPitch(event.pitch);
    const noteItem =
      temperamentManager.selectedTemperament.noteNames.indexOf(noteName);
    // TODO: this may need to take the temperament into account
    const noteItemOffset = centOffset / 200;
    this._notes.value?.scrollToItem(noteItem + noteItemOffset, {
      duration: 100,
    });
    this._centOffset = centOffset;
  }

  private _resetPitch() {
    const refNoteItem =
      temperamentManager.selectedTemperament.noteNames.indexOf(
        temperamentManager.selectedTemperament.referenceName
      );
    const refOctaveItem = OCTAVE_RADIUS;
    this._notes.value?.scrollToItem(refNoteItem);
    this._octaves.value?.scrollToItem(refOctaveItem, { duration: 0 });
    this._updateGeneratedPitch(refNoteItem, refOctaveItem);
  }

  private _updateGeneratedPitch(noteItem: number, octaveItem: number) {
    const noteNames = temperamentManager.selectedTemperament.noteNames;
    const noteIndex =
      ((noteItem % noteNames.length) + noteNames.length) % noteNames.length;
    const octave =
      octaveItem -
      OCTAVE_RADIUS +
      temperamentManager.selectedTemperament.referenceOctave;
    const pitch = temperamentManager.selectedTemperament.getPitch(
      noteNames[noteIndex],
      octave
    );
    this._pitchGenerator.pitch = this._pitch = pitch;
  }
}
