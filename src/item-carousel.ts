import { LitElement, PropertyValues, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { createRef, ref } from "lit/directives/ref.js";
import { FlingManager } from "./fling.js";
import { themeManager } from "./settings/theme.js";

function arraysEqual<T>(a1: T[], a2: T[]): boolean {
  if (a1.length !== a2.length) return false;

  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) return false;
  }
  return true;
}

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

  @property({
    attribute: false,
    hasChanged: (v1?: any[], v2?: any[]) =>
      v1 !== v2 && !arraysEqual(v1 ?? [], v2 ?? []),
  })
  items!: any[];
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
  private _textBuffers: HTMLCanvasElement[] = [];
  private _resizeObserver: ResizeObserver;
  private _flingManager = new FlingManager();
  private _lastX: number | null = null;
  private _currentScroll: Promise<void> | null = null;

  constructor() {
    super();

    this._resizeObserver = new ResizeObserver((entries) => {
      this._handleResize(entries);
    });
    this._resizeObserver.observe(this);

    themeManager.addEventListener("theme-select", () => this.requestUpdate());
  }

  override render() {
    return html`<canvas
      width=${this._width}
      height=${this._height}
      aria-label=${ifDefined(this.label)}
      @pointerdown=${this._handlePointerDown}
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

  override updated(changedProperties: PropertyValues) {
    if (
      changedProperties.has("items") ||
      changedProperties.has("itemWidth") ||
      changedProperties.has("itemHeight") ||
      changedProperties.has("_height")
    ) {
      this._updateTextBuffers();
    }
    this._render();
  }

  get selected(): number {
    return Math.round(this._pos);
  }

  cancelScroll() {
    this._currentScroll = null;
  }

  scrollToItem(target: number, ms = 250): Promise<void> {
    // https://easings.net/#easeInOutQuad
    const ease = (x: number) =>
      x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

    const initial = this._pos;
    const scroll = new Promise<void>((resolve) => {
      let startTime: number | null = null;
      const nextFrame = (time: number) => {
        if (this._currentScroll !== scroll) {
          resolve();
          return;
        }

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

    this._currentScroll = scroll;
    return scroll;
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
    const ctx = canvas.getContext("2d")!;
    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;
    ctx.clearRect(0, 0, w, h);

    const idx = Math.round(this._pos);
    const offset = this._pos - idx;

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
      const itemIdx =
        (((i + idx) % this.items.length) + this.items.length) %
        this.items.length;
      const buffer =
        this._textBuffers[i === 0 ? itemIdx + this.items.length : itemIdx];

      const x = centerX + i * this.itemWidth;
      const scale = Math.exp((-(x - w / 2) * (x - w / 2)) / ((w * w) / 4));
      const dWidth = scale * this.itemWidth;
      const dHeight = scale * this._height;
      const dx = x - dWidth / 2;
      const dy = (this._height - dHeight) / 2;

      ctx.globalAlpha = scale;
      ctx.drawImage(buffer, dx, dy, dWidth, dHeight);
    }
  }

  private _updateTextBuffers() {
    const computedStyle = getComputedStyle(this);
    const shadowSize = 20;

    const renderBuffer = (
      buffer: HTMLCanvasElement,
      item: any,
      highlight: boolean
    ) => {
      const w = (buffer.width = this.itemWidth);
      const h = (buffer.height = this._height);

      const ctx = buffer.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = computedStyle.getPropertyValue("--color-text");
      ctx.font = `${this.itemHeight}px Roboto, sans-serif`;
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      if (highlight) {
        ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
        ctx.shadowBlur = shadowSize;
        ctx.shadowColor = computedStyle.getPropertyValue("--color-primary");
      }

      ctx.fillText(item.toString(), w / 2, h / 2, w - 2 * shadowSize);

      return buffer;
    };

    this._textBuffers.splice(this.items.length * 2);
    for (let i = this._textBuffers.length; i < this.items.length * 2; i++) {
      this._textBuffers.push(document.createElement("canvas"));
    }

    this.items.forEach((item, i) => {
      renderBuffer(this._textBuffers[i], item, false);
      renderBuffer(this._textBuffers[i + this.items.length], item, true);
    });
  }

  private _handleClick(event: MouseEvent) {
    if (!this.disabled && event.button === 0) {
      if (event.clientX >= 0.6 * this._width) {
        this._onItemSelect(this._pos + 1);
        this.scrollToItem(this._pos + 1);
      } else if (event.clientX <= 0.4 * this._width) {
        this._onItemSelect(this._pos - 1);
        this.scrollToItem(this._pos - 1);
      }
    }
  }

  private _handlePointerDown(event: MouseEvent) {
    if (!this.disabled && event.button === 0) {
      this._flingManager.cancelFling();
      this.cancelScroll();
    }
  }

  private _handlePointerMove(event: MouseEvent) {
    if (!this.disabled && event.buttons & 1) {
      if (this._lastX !== null) {
        this._pos -= (event.clientX - this._lastX) / this.itemWidth;
        this._flingManager.recordPosition(this._pos);
      }
      this._lastX = event.clientX;
    }
  }

  private _handlePointerOut(event: MouseEvent) {
    if (!this.disabled && event.buttons & 1) {
      this._snapItem().then(() => this._onItemSelect(this.selected));
      this._lastX = null;
    }
  }

  private _handlePointerUp(event: MouseEvent) {
    if (!this.disabled && event.button === 0) {
      this._flingManager
        .fling((diff) => (this._pos += diff))
        .then(() => this._snapItem())
        .then(() => this._onItemSelect(this.selected));
      this._lastX = null;
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
    return this.scrollToItem(this.selected);
  }
}
