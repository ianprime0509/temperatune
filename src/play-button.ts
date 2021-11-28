import { LitElement, html, css } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import playIcon from "./play.svg";
import micIcon from "./mic.svg";

export class PlayToggleEvent extends Event {
  constructor(public playing: boolean) {
    super("toggle", { bubbles: true, composed: true });
  }
}

@customElement("tt-play-button")
export class PlayButton extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    button {
      height: 100%;

      background: none;
      border: none;
      border-radius: 50%;

      transition: background 200ms;
    }

    button:hover {
      background: #ccc;
    }

    img {
      width: auto;
      height: 100%;
    }
  `;

  @property({ type: Boolean }) playing = false;
  @query("button") private _button!: HTMLButtonElement;

  override render() {
    return html`
      <button
        aria-label=${this.playing ? "Listen for note" : "Play note"}
        @click=${this._handleClick}
      >
        <img src=${this.playing ? micIcon : playIcon} />
      </button>
    `;
  }

  private _handleClick() {
    this.playing = !this.playing;
    this.dispatchEvent(new PlayToggleEvent(this.playing));
    this._button.animate(
      [
        { boxShadow: "none" },
        { boxShadow: "0 0 20px #1e9be9" },
        { boxShadow: "none" },
      ],
      200
    );
  }
}
