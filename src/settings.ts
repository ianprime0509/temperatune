import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import "./button";

@customElement("tt-settings")
export class Settings extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 0.5rem 0;

      user-select: none;
    }

    #container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: start;

      width: 100%;
      height: 100%;

      background: #eee;
    }
  `;

  override render() {
    return html`<div id="container">
      <h1>Temperament</h1>
      <tt-button>
        <h2>Equal temperament</h2>
        <p>Description</p>
      </tt-button>
      <h1>Theme</h1>
      <tt-button>Light</tt-button>
      <tt-button>Dark</tt-button>
      <h1>About</h1>
      <p>
        Temperatune is free software, released under the
        <a href="https://spdx.org/licenses/MIT.html">MIT license</a>. You can
        find its source code on
        <a href="https://github.com/ianprime0509/temperatune">GitHub</a>.
      </p>
    </div>`;
  }
}
