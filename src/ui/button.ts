import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
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

      button:not([disabled]):hover {
        background: var(--color-bg-hover);
      }
    `,
  ];

  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) pulse = false;
  @property({ type: Boolean }) round = false;
  @property({ attribute: "aria-label" }) label?: string;
  private _button = createRef<HTMLButtonElement>();

  override render() {
    return html`<button
      class=${classMap({ round: this.round })}
      aria-label=${ifDefined(this.label)}
      ?disabled=${this.disabled}
      @click=${this._handleClick}
      ${ref(this._button)}
    >
      <slot></slot>
    </button>`;
  }

  private _handleClick() {
    const button = this._button.value;
    if (this.pulse && button !== undefined) {
      button.animate(
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
