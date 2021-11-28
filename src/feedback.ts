import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";

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

  override render() {
    return html`<div><span>In tune</span></div>`;
  }
}
