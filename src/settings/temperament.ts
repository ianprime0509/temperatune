import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, ref } from "lit/directives/ref.js";
import { Temperament, TemperamentData } from "temperament";
import "../ui/button.js";
import { commonStyles } from "../style.js";
import equalTemperament from "../temperaments/equal.json";
import pythagoreanDTemperament from "../temperaments/pythagoreanD.json";
import quarterCommaMeantoneTemperament from "../temperaments/quarterCommaMeantone.json";

export class TemperamentSelectEvent extends Event {
  constructor(public temperament: Temperament) {
    super("temperament-select");
  }
}

export class TemperamentManager extends EventTarget {
  private static readonly _storageKeyData = "temperaments";
  private static readonly _storageKeySelected = "selectedTemperament";

  private _temperaments = [
    new Temperament(equalTemperament as unknown as TemperamentData),
    new Temperament(pythagoreanDTemperament as unknown as TemperamentData),
    new Temperament(
      quarterCommaMeantoneTemperament as unknown as TemperamentData
    ),
  ];
  private _selectedIndex = 0;

  constructor() {
    super();

    const savedTemperaments = localStorage.getItem(
      TemperamentManager._storageKeyData
    );
    if (savedTemperaments !== null) {
      this._temperaments = (
        JSON.parse(savedTemperaments) as TemperamentData[]
      ).map((data) => new Temperament(data));
    } else {
      this._temperaments = [
        // https://github.com/microsoft/TypeScript/issues/32063
        new Temperament(equalTemperament as unknown as TemperamentData),
        new Temperament(pythagoreanDTemperament as unknown as TemperamentData),
        new Temperament(
          quarterCommaMeantoneTemperament as unknown as TemperamentData
        ),
      ];
    }

    const selectedIndex = localStorage.getItem(
      TemperamentManager._storageKeySelected
    );
    this._selectedIndex =
      selectedIndex !== null ? Number.parseInt(selectedIndex, 10) : 0;

    this._save();
  }

  get selectedTemperament(): Temperament {
    return this._temperaments[this._selectedIndex];
  }

  get temperaments(): Temperament[] {
    return [...this._temperaments];
  }

  set selectedTemperamentReferencePitch(pitch: number) {
    this.selectedTemperament.referencePitch = pitch;
    this._save();
    this.dispatchEvent(new TemperamentSelectEvent(this.selectedTemperament));
  }

  add(temperament: Temperament) {
    if (
      this._temperaments.findIndex((t) => t.name === temperament.name) !== -1
    ) {
      throw new Error(`A temperament named ${temperament.name} already exists`);
    }

    this._temperaments.push(temperament);
    this._selectedIndex = this._temperaments.length - 1;
    this._save();
    this.dispatchEvent(new TemperamentSelectEvent(this.selectedTemperament));
  }

  remove(name: string) {
    const index = this._temperaments.findIndex((t) => t.name === name);
    if (index === -1) return;

    this._temperaments.splice(index, 1);
    if (this._selectedIndex === this._temperaments.length) {
      this._selectedIndex--;
    }
    this._save();
    this.dispatchEvent(new TemperamentSelectEvent(this.selectedTemperament));
  }

  select(name: string) {
    const index = this._temperaments.findIndex((t) => t.name === name);
    if (index === -1) {
      throw new Error(`No such temperament: ${name}`);
    }
    this._selectedIndex = index;
    this._save();
    this.dispatchEvent(new TemperamentSelectEvent(this.selectedTemperament));
  }

  private _save() {
    localStorage.setItem(
      TemperamentManager._storageKeyData,
      JSON.stringify(this._temperaments)
    );
    localStorage.setItem(
      TemperamentManager._storageKeySelected,
      this._selectedIndex.toString()
    );
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

      .button-group {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4rem;

        width: 100%;
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

      .action > .material-icons-round {
        font-size: 2rem;
      }

      .action[disabled] > .material-icons-round {
        color: var(--color-text-disabled);
      }

      #container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: start;
      }

      #file-select {
        display: none;
      }

      #reference-pitch-container {
        display: flex;
        align-items: center;
        justify-content: center;

        font-size: 1.5rem;
      }

      #reference-pitch-input {
        max-width: 5ch;
        margin: 0 0.25rem;

        border: none;
        font-size: 1.5rem;
      }
    `,
  ];

  private _referencePitchInput = createRef<HTMLInputElement>();
  private _fileSelectInput = createRef<HTMLInputElement>();

  constructor() {
    super();

    temperamentManager.addEventListener("temperament-select", (e) =>
      this._handleTemperamentUpdate(e as TemperamentSelectEvent)
    );
  }

  override render() {
    return html`<link
        href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
        rel="stylesheet"
      />
      <div id="container">
        ${this._referencePitchSelector()}
        ${temperamentManager.temperaments.map((temperament) =>
          this._temperamentButton(temperament)
        )}
        <div class="button-group">
          <tt-button
            id="add"
            class="action"
            round
            aria-label="Add temperament"
            @click=${this._handleTemperamentAddClick}
          >
            <span class="material-icons-round" aria-hidden="true">add</span>
            <input
              id="file-select"
              type="file"
              accept=".json, application/json"
              @change=${this._handleTemperamentAddFileSelect}
              ${ref(this._fileSelectInput)}
            />
          </tt-button>
          <tt-button
            id="remove"
            class="action"
            round
            aria-label=${`Remove ${temperamentManager.selectedTemperament.name}`}
            ?disabled=${temperamentManager.temperaments.length <= 1}
            @click=${this._handleTemperamentRemoveClick}
          >
            <span class="material-icons-round" aria-hidden="true">remove</span>
          </tt-button>
        </div>
      </div>`;
  }

  private _handleReferencePitchChange() {
    const referencePitchInput = this._referencePitchInput.value;
    if (referencePitchInput !== undefined) {
      const pitch = parseInt(referencePitchInput.value, 10);
      if (pitch > 0) {
        temperamentManager.selectedTemperamentReferencePitch = pitch;
      }
    }
  }

  private _handleTemperamentAddClick() {
    this._fileSelectInput.value?.click();
  }

  private async _handleTemperamentAddFileSelect() {
    const blob = this._fileSelectInput.value?.files?.[0];
    if (blob === undefined) return;

    const data = JSON.parse(await blob.text()) as TemperamentData;
    temperamentManager.add(new Temperament(data));
  }

  private _handleTemperamentRemoveClick() {
    temperamentManager.remove(temperamentManager.selectedTemperament.name);
  }

  private _handleTemperamentSelect(temperament: Temperament) {
    temperamentManager.select(temperament.name);
  }

  private _handleTemperamentUpdate(event: TemperamentSelectEvent) {
    if (this._referencePitchInput.value) {
      this._referencePitchInput.value.value =
        event.temperament.referencePitch.toString();
    }
    this.requestUpdate();
  }

  private _referencePitchSelector() {
    return html`<div id="reference-pitch-container">
      <span aria-label="Reference note"
        >${temperamentManager.selectedTemperament
          .referenceName}${temperamentManager.selectedTemperament
          .referenceOctave}</span
      >
      <span style="margin: 0 0.5rem" aria-hidden="true">=</span>
      <input
        id="reference-pitch-input"
        type="number"
        min="1"
        step="1"
        value=${temperamentManager.selectedTemperament.referencePitch}
        aria-label="Reference pitch in Hz"
        @change=${this._handleReferencePitchChange}
        ${ref(this._referencePitchInput)}
      />
      <span aria-hidden="true">Hz</span>
    </div>`;
  }

  private _temperamentButton(temperament: Temperament) {
    return html`<tt-button
      class="temperament ${classMap({
        selected:
          temperament.name === temperamentManager.selectedTemperament.name,
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
