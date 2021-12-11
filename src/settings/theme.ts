import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "../button.js";
import { commonStyles } from "../style.js";

export type ThemeName = "system" | "light" | "dark";

export class ThemeSelectEvent extends Event {
  constructor(public theme: ThemeName) {
    super("theme-select");
  }
}

export class ThemeManager extends EventTarget {
  private _selected: ThemeName = "system";

  get selected(): ThemeName {
    return this._selected;
  }

  set selected(theme: ThemeName) {
    this._selected = theme;
    this.dispatchEvent(new ThemeSelectEvent(this._selected));
  }
}

export const themeManager = new ThemeManager();

themeManager.addEventListener("theme-select", (e) => {
  const rootClasses = document.documentElement.classList;
  switch ((e as ThemeSelectEvent).theme) {
    case "system":
      rootClasses.remove("light", "dark");
      break;
    case "light":
      rootClasses.remove("dark");
      rootClasses.add("light");
      break;
    case "dark":
      rootClasses.remove("light");
      rootClasses.add("dark");
      break;
  }
});

@customElement("tt-theme-selector")
export class ThemeSelector extends LitElement {
  static override styles = [
    commonStyles,
    css`
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
    `,
  ];

  constructor() {
    super();

    themeManager.addEventListener("theme-select", () => this.requestUpdate());
  }

  override render() {
    return html`<div id="container">
      <tt-button
        class=${classMap({ selected: themeManager.selected === "system" })}
        @click=${() => this._handleThemeSelect("system")}
      >
        ${this._themeIcon("var(--color-bg-light)", "var(--color-bg-dark)")}
        <div>System</div>
      </tt-button>
      <tt-button
        class=${classMap({ selected: themeManager.selected === "light" })}
        @click=${() => this._handleThemeSelect("light")}
      >
        ${this._themeIcon("var(--color-bg-light)")}
        <div>Light</div>
      </tt-button>
      <tt-button
        class=${classMap({ selected: themeManager.selected === "dark" })}
        @click=${() => this._handleThemeSelect("dark")}
      >
        ${this._themeIcon("var(--color-bg-dark)")}
        <div>Dark</div>
      </tt-button>
    </div>`;
  }

  private _handleThemeSelect(theme: ThemeName) {
    themeManager.selected = theme;
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
          stroke="var(--color-outline)"
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
            stroke="var(--color-outline)"
            cx="20"
            cy="20"
            r="16"
          />
        </g>
      </svg>`;
    }
  }
}
