export class PitchGenerator {
  private _oscillator: OscillatorNode | null = null;
  private _pitch = 440;

  constructor(private _audioContext: AudioContext) {}

  set pitch(pitch: number) {
    this._pitch = pitch;
    this._oscillator?.frequency?.setValueAtTime(
      pitch,
      this._audioContext.currentTime
    );
  }

  play() {
    if (!this._oscillator) {
      this._oscillator = this._audioContext.createOscillator();
      // If the frequency is set before the first call to play, we need to make
      // sure that the oscillator's frequency matches what was set in _frequency
      this.pitch = this._pitch;
      this._oscillator.start();
    }
    this._oscillator.connect(this._audioContext.destination);
    this._audioContext.resume();
  }

  pause() {
    if (this._oscillator) {
      this._audioContext.suspend();
      this._oscillator.disconnect(this._audioContext.destination);
    }
  }
}
