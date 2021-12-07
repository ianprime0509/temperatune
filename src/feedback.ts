import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { commonStyles } from "./style";

const IN_TUNE_OFFSET = 5;

@customElement("tt-feedback")
export class Feedback extends LitElement {
  static override styles = [
    commonStyles,
    css`
      :host {
        display: block;
      }

      #container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        width: 100%;
        height: 100%;
      }

      #feedback {
        font-size: 3rem;
        text-align: center;

        user-select: none;
      }

      #pitch {
        color: var(--color-text-secondary);
        font-size: 1.5rem;
        text-align: center;

        user-select: none;
      }
    `,
  ];

  @property({ type: Number }) centOffset!: number;
  @property({ type: Number }) pitch!: number;

  override render() {
    const rounded = Math.round(this.centOffset);
    const abs = Math.abs(rounded);
    let text;
    if (abs < IN_TUNE_OFFSET) {
      text = "In tune";
    } else {
      text = `${abs} ${abs === 1 ? "cent" : "cents"} ${
        rounded > 0 ? "sharp" : "flat"
      }`;
    }
    return html`<div id="container">
      <div id="feedback" aria-label="Feedback">${text}</div>
      <div id="pitch" aria-label="Pitch">${this.pitch.toFixed(0)} Hz</div>
    </div>`;
  }
}
