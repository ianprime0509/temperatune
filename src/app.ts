import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "./ui/button.js";
import "./settings/index.js";
import "./tuner.js";
import { commonStyles } from "./style.js";

@customElement("tt-app")
export class App extends LitElement {
  static override styles = [
    commonStyles,
    css`
      :host {
        display: block;
      }

      #container {
        display: flex;

        width: 100vw;
        height: 100vh;
      }

      #menu-button {
        position: absolute;

        margin: 0.5rem;

        width: 3rem;
        height: 3rem;

        z-index: 2;
      }

      .hidden {
        /*
         * Using display: none prevents the first drawer opening animation from
         * playing, since it does not have a position on the page before the
         * animation starts (it just pops open immediately with no animation)
         */
        visibility: hidden;
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
    `,
  ];

  @state() private _settingsOpen = false;
  @state() private _settingsHidden = true;
  @state() private _tunerHidden = false;

  override render() {
    return html`<link
        href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
        rel="stylesheet"
      />
      <div id="container">
        <tt-button
          id="menu-button"
          round
          aria-label=${this._settingsOpen ? "Close settings" : "Open settings"}
          @click=${this._toggleSettingsOpen}
        >
          <span class="material-icons-round" aria-hidden="true"
            >${this._settingsOpen ? "arrow_back" : "menu"}</span
          >
        </tt-button>
        <tt-settings
          class=${classMap({
            hidden: this._settingsHidden,
            open: this._settingsOpen,
          })}
          @transitionend=${this._handleSettingsTransitionEnd}
        ></tt-settings>
        <tt-tuner class=${classMap({ hidden: this._tunerHidden })}></tt-tuner>
      </div>`;
  }

  private _handleSettingsTransitionEnd() {
    this._settingsHidden = !this._settingsOpen;
    this._tunerHidden = this._settingsOpen;
  }

  private _toggleSettingsOpen() {
    this._settingsOpen = !this._settingsOpen;
    // Both panels need to be visible for the duration of the animation
    this._settingsHidden = this._tunerHidden = false;
  }
}
