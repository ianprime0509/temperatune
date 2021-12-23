import { LitElement, css, html, unsafeCSS } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import dialogPolyfill from "dialog-polyfill";
import { commonStyles, iconFontLink } from "../style.js";
import "../ui/button.js";

import dialogStyles from "dialog-polyfill/dialog-polyfill.css";

/* eslint-disable */
// https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1029#issuecomment-968299542
declare interface HTMLDialogElement extends HTMLElement {
  open: boolean;
  returnValue: string;
  close(returnValue?: string): void;
  show(): void;
  showModal(): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDialogElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLDialogElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}
/* eslint-enable */

@customElement("tt-dialog")
export class Dialog extends LitElement {
  static override styles = [
    commonStyles,
    unsafeCSS(dialogStyles),
    css`
      @keyframes fade-in {
        from {
          opacity: 0;
        }

        to {
          opacity: 1;
        }
      }

      dialog {
        width: 30rem;
        height: 15rem;

        border: none;
        padding: 0;

        background: var(--color-bg);
        box-shadow: 0 0 10px var(--color-outline);
      }

      #close-button {
        margin: 0.5rem;

        width: 3rem;
        height: 3rem;
      }

      #contents {
        display: flex;
        flex-direction: column;

        width: 100%;
        height: 100%;
      }

      #header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      #header > h1 {
        flex-grow: 1;

        margin: 0 1rem;
      }

      #options {
        display: flex;
        align-items: center;
        justify-content: space-around;

        padding: 0 1rem 1rem 1rem;
      }

      #user-contents {
        flex-grow: 1;

        padding: 0 1rem 1rem 1rem;
      }

      .option-text {
        margin: 0.5rem 1rem;

        font-size: 1.5rem;
      }
    `,
  ];

  @property() heading!: string;
  @property({ attribute: false }) options: string[] = [];
  private _dialog = createRef<HTMLDialogElement>();

  override firstUpdated() {
    if (this._dialog.value !== undefined) {
      dialogPolyfill.registerDialog(this._dialog.value);
    }
  }

  override render() {
    return html`${iconFontLink}
      <dialog
        aria-labelledby="heading"
        @click=${this._handleDialogClick}
        ${ref(this._dialog)}
      >
        <div id="contents">
          <div id="header">
            <h1 id="heading">${this.heading}</h1>
            <tt-button
              id="close-button"
              round
              aria-label="Close"
              @click=${() => this.close()}
            >
              <span class="material-icons-round">close</span>
            </tt-button>
          </div>
          <div id="user-contents">
            <slot></slot>
          </div>
          <div id="options">
            ${this.options.map(
              (option) =>
                html`<tt-button @click=${() => this.close(option)}>
                  <div class="option-text">${option}</div>
                </tt-button>`
            )}
          </div>
        </div>
      </dialog>`;
  }

  get returnValue(): string {
    return this._dialog.value?.returnValue ?? "";
  }

  set returnValue(value: string) {
    if (this._dialog.value) {
      this._dialog.value.returnValue = value;
    }
  }

  close(returnValue?: string) {
    const dialog = this._dialog.value;
    if (dialog !== undefined) {
      dialog
        .animate([{ opacity: 1 }, { opacity: 0 }], 150)
        .finished.finally(() => {
          dialog.close(returnValue);
          this.dispatchEvent(new Event("close"));
        });
    }
  }

  showModal() {
    const dialog = this._dialog.value;
    if (dialog !== undefined) {
      dialog.showModal();
      dialog.animate([{ opacity: 0 }, { opacity: 1 }], 150);
    }
  }

  private _handleDialogClick(event: MouseEvent) {
    if (event.target === this._dialog.value) {
      this.close();
    }
  }
}
