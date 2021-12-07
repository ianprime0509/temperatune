import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import "./button";
import "./settings/index";
import "./tuner";
import { commonStyles } from "./style";

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
        <tt-button round id="menu-button" @click=${this._toggleSettingsOpen}>
          <span class="material-icons-round"
            >${this._settingsOpen ? "arrow_back" : "menu"}</span
          >
        </tt-button>
        <tt-settings
          class=${classMap({
            hidden: this._settingsHidden,
            open: this._settingsOpen,
          })}
          @animationend=${this._handleSettingsAnimationEnd}
        ></tt-settings>
        <tt-tuner class=${classMap({ hidden: this._tunerHidden })}></tt-tuner>
      </div>`;
  }

  private _handleSettingsAnimationEnd() {
    this._settingsHidden = !this._settingsOpen;
    this._tunerHidden = this._settingsOpen;
  }

  private _toggleSettingsOpen() {
    this._settingsOpen = !this._settingsOpen;
    // Both panels need to be visible for the duration of the animation
    this._settingsHidden = this._tunerHidden = false;
  }
}
