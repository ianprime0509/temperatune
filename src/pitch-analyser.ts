import { PitchDetector } from "pitchy";

export class PitchUpdateEvent extends Event {
  constructor(public pitch: number, public clarity: number) {
    super("pitchupdate");
  }
}

export class PitchAnalyser extends EventTarget {
  private _analyserNode: AnalyserNode;
  private _buffer: Float32Array;
  private _pitchDetector: PitchDetector<Float32Array>;
  private _microphoneSource: MediaStreamAudioSourceNode | null = null;
  private _interval: number | null = null;

  constructor(private _audioContext: AudioContext) {
    super();
    this._analyserNode = _audioContext.createAnalyser();
    this._buffer = new Float32Array(this._analyserNode.fftSize);
    this._pitchDetector = PitchDetector.forFloat32Array(this._buffer.length);
  }

  async listen() {
    if (!this._microphoneSource) {
      this._microphoneSource = await this._obtainMicrophoneSource();
    }

    this._microphoneSource.connect(this._analyserNode);
    this._audioContext.resume();
    this._interval && clearInterval(this._interval);
    this._interval = setInterval(() => {
      this._analyserNode.getFloatTimeDomainData(this._buffer);
      const [pitch, clarity] = this._pitchDetector.findPitch(
        this._buffer,
        this._audioContext.sampleRate
      );
      this.dispatchEvent(new PitchUpdateEvent(pitch, clarity));
    }, 150);
  }

  stop() {
    if (this._interval) {
      clearInterval(this._interval);
      this._interval = null;
    }
    if (this._microphoneSource) {
      this._microphoneSource.disconnect(this._analyserNode);
      // By stopping the microphone source tracks, we signal to the browser that
      // we won't be using the microphone until later (this seems to have an
      // impact on the volume type chosen for Android)
      this._microphoneSource.mediaStream
        .getTracks()
        .forEach((track) => track.stop());
      this._microphoneSource = null;

      // If we don't recreate the analyser for each new connection, then for some
      // reason trying to reconnect to it doesn't work
      this._analyserNode = this._audioContext.createAnalyser();
      this._buffer = new Float32Array(this._analyserNode.fftSize);
      this._pitchDetector = PitchDetector.forFloat32Array(this._buffer.length);
    }
  }

  private async _obtainMicrophoneSource() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return this._audioContext.createMediaStreamSource(stream);
  }
}
