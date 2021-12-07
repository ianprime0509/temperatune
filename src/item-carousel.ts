import Color from "color";
import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { createRef, ref } from "lit/directives/ref.js";
import { FlingManager } from "./fling";

export class ItemSelectEvent extends Event {
  readonly item: number;

  constructor(item: number) {
    super("item-select", { bubbles: true, composed: true });
    this.item = item;
  }
}

@customElement("tt-item-carousel")
export class ItemCarousel extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    canvas {
      touch-action: pan-y pinch-zoom;
    }
  `;

  @property({ attribute: false }) items!: any[];
  @property({ type: Boolean }) disabled: boolean = false;
  @property({ type: Number }) itemWidth = 300;
  @property({ type: Number }) itemHeight = 150;
  @property() label?: string;
  @property({ type: Number }) min = Number.NEGATIVE_INFINITY;
  @property({ type: Number }) max = Number.POSITIVE_INFINITY;
  private __pos = 0;
  @state() private _width = 0;
  @state() private _height = 0;
  private _canvas = createRef<HTMLCanvasElement>();
  private _resizeObserver: ResizeObserver;
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
      aria-label=${ifDefined(this.label)}
      @pointermove=${this._handlePointerMove}
      @pointerout=${this._handlePointerOut}
      @pointerup=${this._handlePointerUp}
      ${ref(this._canvas)}
      >${this._item(this.selected)}</canvas
    >`;
  }

  override shouldUpdate(changedProperties: PropertyValues) {
    if (
      changedProperties.size === 0 ||
      (changedProperties.size === 1 && changedProperties.has("_note"))
    ) {
      this._render();
      return false;
    }
    return true;
  }

  override updated() {
    this._render();
  }

  get selected(): number {
    return Math.round(this._pos);
  }

  scrollToItem(target: number, ms = 250): Promise<void> {
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

  @state()
  private get _pos(): number {
    return this.__pos;
  }

  private set _pos(value: number) {
    const oldValue = this._pos;
    this.__pos = Math.max(this.min, Math.min(value, this.max));
    this.requestUpdate("_pos", oldValue);
  }

  private _item(i: number) {
    return this.items[
      ((i % this.items.length) + this.items.length) % this.items.length
    ];
  }

  private _render() {
    const canvas = this._canvas.value!;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const textColor = Color(
      getComputedStyle(this).getPropertyValue("--color-text").trim()
    );

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    ctx.shadowOffsetX = ctx.shadowOffsetY = 0;

    const idx = Math.round(this._pos);
    const offset = this._pos - idx;

    const y = h / 2;
    const centerX = w / 2 - this.itemWidth * offset;
    const startI = Math.max(
      -Math.floor((centerX + this.itemWidth) / this.itemWidth),
      this.min - idx
    );
    const endI = Math.min(
      Math.floor((w - centerX + this.itemWidth) / this.itemWidth),
      this.max - idx
    );
    for (let i = startI; i <= endI; i++) {
      const x = centerX + i * this.itemWidth;
      const scale = Math.exp((-(x - w / 2) * (x - w / 2)) / ((w * w) / 4));
      if (i === 0) {
        ctx.shadowBlur = 20 * Math.pow(scale, 8);
        ctx.shadowColor = "#1e9be9";
      } else {
        ctx.shadowBlur = 0;
        ctx.shadowColor = "transparent";
      }
      ctx.fillStyle = textColor.alpha(scale).toString();
      ctx.font = `${this.itemHeight * scale}px sans-serif`;
      ctx.fillText(this._item(i + idx).toString(), x, y, this.itemWidth);
    }
  }

  private _handlePointerMove(event: MouseEvent) {
    if (!this.disabled && event.buttons & 1) {
      this._pos -= event.movementX / this.itemWidth;
      this._flingManager.recordPosition(this._pos);
    }
  }

  private _handlePointerOut(event: MouseEvent) {
    if (!this.disabled && event.buttons & 1) {
      this._snapItem().then(() => this._onItemSelect(this._pos));
    }
  }

  private _handlePointerUp(event: MouseEvent) {
    if (!this.disabled && event.button === 0) {
      this._flingManager
        .fling((diff) => (this._pos += diff))
        .then(() => this._snapItem())
        .then(() => this._onItemSelect(this._pos));
    }
  }

  private _handleResize(entries: ResizeObserverEntry[]) {
    const entry = entries.find((entry) => entry.target === this);
    if (entry) {
      this._width = entry.contentRect.width;
      this._height = entry.contentRect.height;
    }
  }

  private _onItemSelect(item: number) {
    this.dispatchEvent(new ItemSelectEvent(item));
  }

  private _snapItem(): Promise<void> {
    return this.scrollToItem(Math.round(this._pos));
  }
}
