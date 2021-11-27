import { LitElement, css, html } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";
import { FlingManager } from "./fling";

export class NoteChangeEvent extends Event {
  readonly note: number;

  constructor(note: number) {
    super("notechange", { bubbles: true, composed: true });
    this.note = note;
  }
}

@customElement("tt-notes")
export class Notes extends LitElement {
  static override styles = css`
    :host {
      flex-grow: 1;

      width: 100%;
      max-height: 50%;
    }

    canvas {
      touch-action: none;
    }
  `;

  @property({ type: Array }) noteNames = [
    "A",
    "B♭",
    "B",
    "C",
    "C♯",
    "D",
    "E♭",
    "F",
    "F♯",
    "G",
    "G♯",
  ];
  @property({ type: Number }) noteWidth = 300;
  @property({ type: Number }) noteHeight = 150;
  @state() private _pos = 0;
  @state() private _width = 0;
  @state() private _height = 0;
  private _resizeObserver: ResizeObserver;
  private _canvas?: HTMLCanvasElement;
  private _flingManager = new FlingManager();

  constructor() {
    super();
    this._resizeObserver = new ResizeObserver((entries) => {
      this._handleResize(entries);
    });
    this._resizeObserver.observe(this);
  }

  override render() {
    return html`<canvas
      width=${this._width}
      height=${this._height}
      @pointermove=${this._handleMouseMove}
      @pointerout=${this._handleMouseOut}
      @pointerup=${this._handleMouseUp}
      ${ref((canvas) => this._handleCanvas(canvas as HTMLCanvasElement))}
    ></canvas>`;
  }

  override shouldUpdate(changedProperties: PropertyValues): boolean {
    if (changedProperties.has("note")) {
      this._handleCanvas(this._canvas);
      return changedProperties.size > 1;
    }
    return true;
  }

  scrollToNote(target: number, ms = 250): Promise<void> {
    // https://easings.net/#easeInOutQuad
    const ease = (x: number) =>
      x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

    const initial = this._pos;
    return new Promise((resolve) => {
      let startTime: number | null = null;
      const nextFrame = (time: number) => {
        let elapsed;
        if (startTime === null) {
          startTime = time;
          elapsed = 0;
        } else {
          elapsed = time - startTime;
        }
        const progress = ms > 0 ? ease(Math.min(elapsed / ms, 1)) : 1;
        this._pos = initial + (target - initial) * progress;
        if (elapsed >= ms) {
          resolve();
        } else {
          requestAnimationFrame(nextFrame);
        }
      };
      requestAnimationFrame(nextFrame);
    });
  }

  private _handleCanvas(canvas?: HTMLCanvasElement) {
    if (!(this._canvas = canvas)) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = "red";
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    const idx = Math.round(this._pos);
    const offset = this._pos - idx;

    const y = h / 2;
    const centerX = w / 2 - this.noteWidth * offset;
    const text = (i: number) =>
      this.noteNames[
        (((i + idx) % this.noteNames.length) + this.noteNames.length) %
          this.noteNames.length
      ];

    const startI = -Math.floor((centerX + this.noteWidth) / this.noteWidth);
    const endI = Math.floor((w - centerX + this.noteWidth) / this.noteWidth);
    for (let i = startI; i <= endI; i++) {
      const x = centerX + i * this.noteWidth;
      const scale = Math.exp((-(x - w / 2) * (x - w / 2)) / ((w * w) / 4));
      ctx.fillStyle = `rgba(0, 0, 0, ${scale})`;
      ctx.font = `${this.noteHeight * scale}px sans-serif`;
      ctx.fillText(text(i), x, y, this.noteWidth);
    }
  }

  private _handleMouseMove(event: MouseEvent) {
    if (event.buttons & 1) {
      this._pos -= event.movementX / this.noteWidth;
      this._flingManager.recordPosition(this._pos);
    }
  }

  private _handleMouseOut(event: MouseEvent) {
    if (event.buttons & 1) {
      this._snapNote().then(() => this._onNoteChanged(this._pos));
    }
  }

  private _handleMouseUp(event: MouseEvent) {
    if (event.button === 0) {
      this._flingManager
        .fling((diff) => (this._pos += diff))
        .then(() => this._snapNote())
        .then(() => this._onNoteChanged(this._pos));
    }
  }

  private _handleResize(entries: ResizeObserverEntry[]) {
    const entry = entries.find((entry) => entry.target === this);
    if (entry) {
      this._width = entry.contentRect.width;
      this._height = entry.contentRect.height;
    }
  }

  private _onNoteChanged(note: number) {
    this.dispatchEvent(new NoteChangeEvent(note));
  }

  private _snapNote(): Promise<void> {
    return this.scrollToNote(Math.round(this._pos));
  }
}
