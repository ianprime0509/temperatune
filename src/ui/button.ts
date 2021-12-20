import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, ref } from "lit/directives/ref.js";
import { commonStyles } from "../style.js";

@customElement("tt-button")
export class Button extends LitElement {
  static override styles = [
    commonStyles,
    css`
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
        color: inherit;

        transition: background 200ms;

        font-weight: bold;
      }

      button.round {
        border-radius: 50%;
      }

      button:hover {
        background: var(--color-bg-hover);
      }
    `,
  ];

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
          { boxShadow: "0 0 20px var(--color-primary)" },
          { boxShadow: "none" },
        ],
        250
      );
    }
  }
}
