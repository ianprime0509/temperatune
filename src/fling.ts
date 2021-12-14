export class FlingManager {
  readonly #maxInteractionDelay;
  readonly #maxMeasurements;
  readonly #minVelocity;
  #lastTX: [number, number] | null = null;
  #measurements: number[] = [];
  #currentFling: Promise<void> | null = null;

  constructor({
    maxInteractionDelay = 250,
    maxMeasurements = 3,
    minVelocity = 1e-4,
  } = {}) {
    this.#maxInteractionDelay = maxInteractionDelay;
    this.#maxMeasurements = maxMeasurements;
    this.#minVelocity = minVelocity;
  }

  cancelFling() {
    this.#currentFling = null;
  }

  fling(delta: (diff: number) => void): Promise<void> {
    const fling = new Promise<void>((resolve) => {
      if (this.#measurements.length === 0 || this.#lastTX === null) {
        resolve();
        return;
      }

      const t = performance.now();
      if (t - this.#lastTX[0] > this.#maxInteractionDelay) {
        this.#measurements = [];
        this.#lastTX = null;
        resolve();
        return;
      }

      let velocity =
        this.#measurements.reduce((v1, v2) => v1 + v2) /
        this.#measurements.length;
      this.#measurements = [];
      this.#lastTX = null;

      let previousTime = t;
      const update = (time: number) => {
        if (this.#currentFling !== fling) return;

        const timeDiff = time - previousTime;
        previousTime = time;

        velocity -= velocity / timeDiff;
        if (Math.abs(velocity) < this.#minVelocity) {
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
    this.#currentFling = fling;
    return fling;
  }

  recordPosition(x: number) {
    const t = performance.now();
    if (this.#lastTX !== null && t > this.#lastTX[0]) {
      const [lastT, lastX] = this.#lastTX;
      if (t - lastT <= this.#maxInteractionDelay) {
        this.#measurements.push((x - lastX) / (t - lastT));
        if (this.#measurements.length > this.#maxMeasurements) {
          this.#measurements.splice(0, 1);
        }
      } else {
        this.#measurements = [];
      }
    }
    this.#lastTX = [t, x];
  }
}
