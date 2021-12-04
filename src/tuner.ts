import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { PitchAnalyser, PitchUpdateEvent } from "./pitch-analyser";
import { PitchGenerator } from "./pitch-generator";
import { equalTemperament } from "./temperaments";
import "./button";
import "./feedback";
import "./item-carousel";
import { ItemCarousel, ItemSelectEvent } from "./item-carousel";
import micIcon from "./mic.svg";
import playIcon from "./play.svg";

const OCTAVE_RADIUS = 2;

const audioContext = new AudioContext();

@customElement("tt-tuner")
export class Tuner extends LitElement {
  static override styles = css`
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

      background: #eee;
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

    #play-button {
      height: 20%;
      max-height: 20%;
    }
  `;

  @state() private _playing = false;
  @state() private _centOffset = 0;
  @state() private _temperament = equalTemperament;
  private _notes = createRef<ItemCarousel>();
  private _octaves = createRef<ItemCarousel>();
  private _pitchAnalyser = new PitchAnalyser(audioContext);
  private _pitchGenerator = new PitchGenerator(audioContext);

  constructor() {
    super();
    this._pitchAnalyser.addEventListener("pitchupdate", (e) =>
      this._handlePitchUpdate(e as PitchUpdateEvent)
    );
  }

  override render() {
    return html`<main>
      <tt-item-carousel
        id="notes"
        label="Note"
        ?disabled=${!this._playing}
        .items=${this._temperament.noteNames}
        @itemselect=${this._handleNoteItemSelect}
        ${ref(this._notes)}
      ></tt-item-carousel>
      ${this._playing
        ? html`<tt-item-carousel
            id="octaves"
            label="Octave"
            .items=${this._temperament.getOctaveRange(OCTAVE_RADIUS)}
            itemHeight="50"
            min="0"
            max="4"
            @itemselect=${this._handleOctaveItemSelect}
            ${ref(this._octaves)}
          ></tt-item-carousel>`
        : html`<tt-feedback
            id="feedback"
            centOffset=${this._centOffset}
          ></tt-feedback>`}
      <tt-button
        pulse
        round
        id="play-button"
        @click=${() => (this._playing = !this._playing)}
        ><img src=${this._playing ? micIcon : playIcon}
      /></tt-button>
    </main>`;
  }

  override updated(changedProperties: PropertyValues) {
    if (changedProperties.has("_playing")) {
      const refNoteItem = this._temperament.noteNames.indexOf(
        this._temperament.referenceName
      );
      const refOctaveItem = OCTAVE_RADIUS;
      this._notes.value?.scrollToItem(refNoteItem, 250);
      this._octaves.value?.scrollToItem(refOctaveItem, 0);
      this._updateGeneratedPitch(refNoteItem, refOctaveItem);
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

    const [noteName, centOffset] = this._temperament.getNoteNameFromPitch(
      event.pitch
    );
    const noteItem = this._temperament.noteNames.indexOf(noteName);
    // TODO: this may need to take the temperament into account
    const noteItemOffset = centOffset / 200;
    this._notes.value?.scrollToItem(noteItem + noteItemOffset, 100);
    this._centOffset = centOffset;
  }

  private _updateGeneratedPitch(noteItem: number, octaveItem: number) {
    const noteNames = this._temperament.noteNames;
    const noteIndex =
      ((noteItem % noteNames.length) + noteNames.length) % noteNames.length;
    const octave =
      octaveItem - OCTAVE_RADIUS + this._temperament.referenceOctave;
    const pitch = this._temperament.getPitch(noteNames[noteIndex], octave);
    this._pitchGenerator.pitch = pitch;
  }
}
