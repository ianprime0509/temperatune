import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../button";

@customElement("tt-theme-selector")
export class ThemeSelector extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    svg {
      width: 4rem;
      height: 4rem;
    }

    tt-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      margin: 0 0.5rem;
    }

    tt-button.selected > svg {
      filter: drop-shadow(0 0 10px var(--color-primary));
      transition: filter 200ms;
    }

    #container {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  @state() private _selected = "system";

  override render() {
    return html`<div id="container">
      <tt-button
        class=${classMap({ selected: this._selected === "system" })}
        @click=${() => (this._selected = "system")}
      >
        ${this._themeIcon("var(--color-bg-light)", "var(--color-bg-dark)")}
        <div>System</div>
      </tt-button>
      <tt-button
        class=${classMap({ selected: this._selected === "light" })}
        @click=${() => (this._selected = "light")}
      >
        ${this._themeIcon("var(--color-bg-light)")}
        <div>Light</div>
      </tt-button>
      <tt-button
        class=${classMap({ selected: this._selected === "dark" })}
        @click=${() => (this._selected = "dark")}
      >
        ${this._themeIcon("var(--color-bg-dark)")}
        <div>Dark</div>
      </tt-button>
    </div>`;
  }

  private _themeIcon(color1: string, color2?: string) {
    if (color2 === undefined) {
      return html`<svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 40"
        aria-hidden="true"
      >
        <circle
          fill=${color1}
          stroke="var(--color-text-secondary)"
          cx="20"
          cy="20"
          r="16"
        />
      </svg>`;
    } else {
      return html`<svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 40"
        aria-hidden="true"
      >
        <g transform="rotate(45 20 20)">
          <path fill=${color1} d="M 20 4 V 36 A 16 16 0 0 1 20 4 Z" />
          <path fill=${color2} d="M 20 4 V 36 A 16 16 0 0 0 20 4 Z" />
          <circle
            fill="transparent"
            stroke="var(--color-text-secondary)"
            cx="20"
            cy="20"
            r="16"
          />
        </g>
      </svg>`;
    }
  }
}
