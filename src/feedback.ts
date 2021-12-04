import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

const IN_TUNE_OFFSET = 5;

@customElement("tt-feedback")
export class Feedback extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    div {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 100%;
      height: 100%;
    }

    span {
      font-size: 3rem;
      text-align: center;

      user-select: none;
    }
  `;

  @property({ type: Number }) centOffset = 0;

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
    return html`<div><span aria-label="Feedback">${text}</span></div>`;
  }
}
