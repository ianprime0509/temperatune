import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "./button";
import "./settings/index";
import "./tuner";

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

    .material-icons-round {
      color: var(--color-text);
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
    return html`<link
        href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
        rel="stylesheet"
      />
      <div id="container">
        <tt-button
          round
          id="menu-button"
          @click=${() => (this._settingsOpen = !this._settingsOpen)}
        >
          <span class="material-icons-round"
            >${this._settingsOpen ? "arrow_back" : "menu"}</span
          >
        </tt-button>
        <tt-settings
          class=${classMap({ open: this._settingsOpen })}
        ></tt-settings>
        <tt-tuner></tt-tuner>
      </div>`;
  }
}
