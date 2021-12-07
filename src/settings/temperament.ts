import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { Temperament } from "temperament";
import "../button";
import { commonStyles } from "../style";
import equalTemperament from "../temperaments/equal.json";
import pythagoreanDTemperament from "../temperaments/pythagoreanD.json";
import quarterCommaMeantoneTemperament from "../temperaments/quarterCommaMeantone.json";

export class TemperamentSelectEvent extends Event {
  constructor(public temperament: Temperament) {
    super("temperament-select");
  }
}

export class TemperamentManager extends EventTarget {
  private _temperaments = [
    new Temperament(equalTemperament),
    new Temperament(pythagoreanDTemperament),
    new Temperament(quarterCommaMeantoneTemperament),
  ];
  private _selectedIndex = 0;

  get selectedTemperament(): Temperament {
    return this._temperaments[this._selectedIndex];
  }

  get temperaments(): Temperament[] {
    return [...this._temperaments];
  }

  select(name: string) {
    const index = this._temperaments.findIndex((t) => t.name === name);
    if (index === -1) {
      throw new Error(`No such temperament: ${name}`);
    }
    this._selectedIndex = index;
    this.dispatchEvent(new TemperamentSelectEvent(this.selectedTemperament));
  }
}

export const temperamentManager = new TemperamentManager();

@customElement("tt-temperament-selector")
export class TemperamentSelector extends LitElement {
  static override styles = [
    commonStyles,
    css`
      :host {
        display: block;
      }

      .temperament {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        margin: 0.25rem 0;

        width: 100%;
      }

      .temperament-name {
        font-size: 1.1rem;
        font-weight: bold;

        transition: text-shadow 200ms;
      }

      .selected > .temperament-name {
        text-shadow: 0 0 10px var(--color-primary);
      }

      .temperament-description {
        margin: 0;

        color: var(--color-text-secondary);
        font-weight: normal;
      }

      #container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
      }
    `,
  ];

  @state() private _temperaments = temperamentManager.temperaments;
  @state() private _selectedTemperament =
    temperamentManager.selectedTemperament;

  constructor() {
    super();

    window.addEventListener("click", (e) => {});
    temperamentManager.addEventListener(
      "temperament-select",
      (e) =>
        (this._selectedTemperament = (e as TemperamentSelectEvent).temperament)
    );
  }

  override render() {
    return html`<div id="container">
      ${this._temperaments.map((temperament) =>
        this._temperamentButton(temperament)
      )}
    </div>`;
  }

  private _handleTemperamentSelect(temperament: Temperament) {
    temperamentManager.select(temperament.name);
  }

  private _temperamentButton(temperament: Temperament) {
    return html`<tt-button
      class="temperament ${classMap({
        selected: temperament.name === this._selectedTemperament.name,
      })}"
      @click=${() => this._handleTemperamentSelect(temperament)}
    >
      <span class="temperament-name">${temperament.name}</span>
      ${temperament.description
        ? html`<p class="temperament-description">
            ${temperament.description}
          </p>`
        : ""}
    </tt-button>`;
  }
}
