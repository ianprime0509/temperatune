import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "./button";
import "./settings";
import "./tuner";
import backIcon from "./back.svg";
import menuIcon from "./menu.svg";

@customElement("tt-app")
export class App extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    #container {
      display: flex;

      width: 100vw;
      height: 100vh;

      overflow: hidden;
    }

    #menu-button {
      position: absolute;

      margin: 0.5rem;

      width: 3rem;
      height: 3rem;

      z-index: 2;
    }

    tt-settings {
      position: absolute;

      width: 100vw;
      height: 100vh;

      z-index: 1;

      transform: translateX(-100vw);
      transition: transform 300ms;
    }

    tt-settings.open {
      transform: translateX(0);

      box-shadow: 0 0 10px gray;
    }

    tt-tuner {
      position: absolute;

      width: 100vw;
      height: 100vh;
    }
  `;

  @state() private _settingsOpen = false;

  override render() {
    return html`<div id="container">
      <tt-button
        round
        id="menu-button"
        @click=${() => (this._settingsOpen = !this._settingsOpen)}
      >
        <img src=${this._settingsOpen ? backIcon : menuIcon} />
      </tt-button>
      <tt-settings
        class=${classMap({ open: this._settingsOpen })}
      ></tt-settings>
      <tt-tuner></tt-tuner>
    </div>`;
  }
}
