import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, ref } from "lit/directives/ref.js";

@customElement("tt-button")
export class Button extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    button {
      width: 100%;
      height: 100%;

      margin: 0;
      padding: 0.25rem;

      background: none;
      border: none;

      transition: background 200ms;
    }

    button.round {
      border-radius: 50%;
    }

    button:hover {
      background: #ccc;
    }

    ::slotted(img) {
      width: auto;
      height: 100%;
    }
  `;

  @property({ type: Boolean }) pulse = false;
  @property({ type: Boolean }) round = false;
  private _button = createRef<HTMLButtonElement>();

  override render() {
    return html`<button
      class=${classMap({ round: this.round })}
      @click=${this._handleClick}
      ${ref(this._button)}
    >
      <slot></slot>
    </button>`;
  }

  private _handleClick() {
    if (this.pulse) {
      this._button.value!.animate(
        [
          { boxShadow: "none" },
          { boxShadow: "0 0 20px #1e9be9" },
          { boxShadow: "none" },
        ],
        200
      );
    }
  }
}
