import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import "./notes.ts";
import { Notes, NoteChangeEvent } from "./notes.js";

@customElement("tt-app")
export class App extends LitElement {
  static override styles = css`
    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      width: 100vw;
      height: 100vh;
    }
  `;

  @state() private _note: number = 0;
  private _notes = createRef<Notes>();

  override render() {
    return html`<main>
      <tt-notes
        @notechange=${this._handleNoteChange}
        ${ref(this._notes)}
      ></tt-notes>
      <pre>${this._note.toFixed(2)}</pre>
      <button @click=${() => this._shiftNote(-1)}>-1</button>
      <button @click=${() => this._shiftNote(1)}>+1</button>
    </main>`;
  }

  private _handleNoteChange(event: NoteChangeEvent) {
    this._note = event.note;
  }

  private _shiftNote(amount: number) {
    this._note += amount;
    this._notes.value?.scrollToNote(this._note, 1000);
  }
}
