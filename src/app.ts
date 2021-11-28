import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import "./feedback";
import "./item-carousel";
import { ItemCarousel, ItemSelectEvent } from "./item-carousel";
import "./play-button";
import { PlayToggleEvent } from "./play-button";

@customElement("tt-app")
export class App extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      width: 100vw;
      height: 100vh;
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

    tt-feedback {
      height: 20%;
      max-height: 20%;
    }

    tt-play-button {
      height: 20%;
      max-height: 20%;
    }
  `;

  @state() private _playing: boolean = false;
  private _notes = createRef<ItemCarousel>();
  private _octaves = createRef<ItemCarousel>();

  override render() {
    console.log(this._playing);
    return html`<main>
      <tt-item-carousel
        id="notes"
        ?disabled=${!this._playing}
        .items=${[
          "A",
          "B♭",
          "B",
          "C",
          "C♯",
          "D",
          "E♭",
          "E",
          "F",
          "F♯",
          "G",
          "G♯",
        ]}
        @itemselect=${this._handleNoteChange}
        ${ref(this._notes)}
      ></tt-item-carousel>
      ${this._playing
        ? html`<tt-item-carousel
            id="octaves"
            .items=${[2, 3, 4, 5, 6]}
            itemHeight="50"
            min="0"
            max="4"
            @itemselect=${this._handleOctaveChange}
            ${ref(this._octaves)}
          ></tt-item-carousel>`
        : html`<tt-feedback></tt-feedback>`}
      <tt-play-button
        ?playing=${this._playing}
        @toggle=${this._handlePlayToggle}
      ></tt-play-button>
    </main>`;
  }

  override updated(changedProperties: PropertyValues) {
    if (changedProperties.has("_playing") && this._playing) {
      this._notes.value?.scrollToItem(0, 0);
      this._octaves.value?.scrollToItem(2, 0);
    }
  }

  private _handleNoteChange(event: ItemSelectEvent) {}

  private _handleOctaveChange(event: ItemSelectEvent) {}

  private _handlePlayToggle(event: PlayToggleEvent) {
    this._playing = event.playing;
  }
}
