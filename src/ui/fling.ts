export class FlingManager {
  private readonly _maxInteractionDelay;
  private readonly _maxMeasurements;
  private readonly _minVelocity;
  private _lastTX: [number, number] | null = null;
  private _measurements: number[] = [];
  private _currentFling: Promise<void> | null = null;

  constructor({
    maxInteractionDelay = 250,
    maxMeasurements = 3,
    minVelocity = 1e-4,
  } = {}) {
    this._maxInteractionDelay = maxInteractionDelay;
    this._maxMeasurements = maxMeasurements;
    this._minVelocity = minVelocity;
  }

  cancelFling() {
    this._currentFling = null;
  }

  fling(delta: (diff: number) => void): Promise<void> {
    const fling = new Promise<void>((resolve) => {
      if (this._measurements.length === 0 || this._lastTX === null) {
        resolve();
        return;
      }

      const t = performance.now();
      if (t - this._lastTX[0] > this._maxInteractionDelay) {
        this._measurements = [];
        this._lastTX = null;
        resolve();
        return;
      }

      let velocity =
        this._measurements.reduce((v1, v2) => v1 + v2) /
        this._measurements.length;
      this._measurements = [];
      this._lastTX = null;

      let previousTime = t;
      const update = (time: number) => {
        if (this._currentFling !== fling) return;

        const timeDiff = time - previousTime;
        previousTime = time;

        velocity -= velocity / timeDiff;
        if (Math.abs(velocity) < this._minVelocity) {
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
    });
    this._currentFling = fling;
    return fling;
  }

  recordPosition(x: number) {
    const t = performance.now();
    if (this._lastTX !== null && t > this._lastTX[0]) {
      const [lastT, lastX] = this._lastTX;
      if (t - lastT <= this._maxInteractionDelay) {
        this._measurements.push((x - lastX) / (t - lastT));
        if (this._measurements.length > this._maxMeasurements) {
          this._measurements.splice(0, 1);
        }
      } else {
        this._measurements = [];
      }
    }
    this._lastTX = [t, x];
  }
}
