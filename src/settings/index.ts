import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import "../ui/button.js";
import "./temperament.js";
import "./theme.js";
import { commonStyles } from "../style.js";

@customElement("tt-settings")
export class Settings extends LitElement {
  static override styles = [
    commonStyles,
    css`
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

      svg {
        height: 4rem;
        width: auto;
      }

      #container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;

        width: 100%;
        height: 100%;

        background: var(--color-bg);
      }
    `,
  ];

  override render() {
    return html`<div id="container">
      <h1>Temperament</h1>
      <tt-temperament-selector></tt-temperament-selector>

      <h1>Theme</h1>
      <tt-theme-selector></tt-theme-selector>

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
