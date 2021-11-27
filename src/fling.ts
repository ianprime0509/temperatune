export class FlingManager {
  private _t0: number | null = null;
  private _t1: number | null = null;
  private _x0: number | null = null;
  private _x1: number | null = null;

  recordPosition(x: number) {
    this._t0 = this._t1;
    this._x0 = this._x1;
    this._t1 = performance.now();
    this._x1 = x;
  }

  fling(delta: (diff: number) => void): Promise<void> {
    return new Promise((resolve) => {
      if (
        this._t0 !== null &&
        this._t1 !== null &&
        this._t0 < this._t1 &&
        performance.now() - this._t1 <= 300 &&
        this._x0 !== null &&
        this._x1 !== null
      ) {
        let velocity = (this._x1 - this._x0) / (this._t1 - this._t0);
        let acceleration = -velocity / (this._t1 - this._t0) / 10;
        this._t1 = this._x1 = null;
        let previousTime: number | null = null;
        const update = (time: number) => {
          const timeDiff = previousTime !== null ? time - previousTime : 0;
          previousTime = time;
          velocity += acceleration * timeDiff;
          if (Math.sign(velocity) === Math.sign(acceleration)) {
            velocity = 0;
          }
          delta(velocity * timeDiff);
          if (velocity === 0) {
            resolve();
          } else {
            requestAnimationFrame(update);
          }
        };
        requestAnimationFrame(update);
      }
    });
  }
}
