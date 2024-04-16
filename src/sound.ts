enum Note {
  C = 261.63,
  D = 293.66,
  E = 329.63,
  F = 349.23,
  G = 392.0,
  A = 440.0,
  B = 493.88,
}

const audioContext = new AudioContext();
const duration = 200;

let timeout: ReturnType<typeof setTimeout> | null;
let squareWave: OscillatorNode | null;

class WaveBuilder {
  squareWave = audioContext.createOscillator();
  constructor(note: Note) {
    this.squareWave.type = "square";
    this.squareWave.frequency.value = note;
  }

  linerTo(note: Note, offset: number) {
    this.squareWave.frequency.linearRampToValueAtTime(
      note,
      audioContext.currentTime + offset,
    );
    return this;
  }

  expTo(note: Note, offset: number) {
    this.squareWave.frequency.exponentialRampToValueAtTime(
      note,
      audioContext.currentTime + offset,
    );
    return this;
  }

  build() {
    return this.squareWave;
  }
}

class GainBuilder {
  gainNode = audioContext.createGain();
  constructor(gain: number) {
    this.gainNode.gain.setValueAtTime(gain, audioContext.currentTime);
  }

  linerTo(gain: number, offset: number) {
    this.gainNode.gain.linearRampToValueAtTime(
      gain,
      audioContext.currentTime + offset,
    );
    return this;
  }

  expTo(gain: number, offset: number) {
    this.gainNode.gain.exponentialRampToValueAtTime(
      gain,
      audioContext.currentTime + offset,
    );
    return this;
  }

  build() {
    return this.gainNode;
  }
}

export const playMoveSound = () => {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
    if (squareWave) {
      squareWave.stop();
      squareWave = null;
    }
  }

  squareWave = new WaveBuilder(Note.A).expTo(Note.G, 0.1).build();

  const gainNode = new GainBuilder(0.5).linerTo(0, 0.1).build();

  squareWave.connect(gainNode);

  gainNode.connect(audioContext.destination);

  squareWave.start();

  timeout = setTimeout(() => {
    if (squareWave) {
      squareWave.stop();
    }
  }, duration);
};

export const playSnapSound = () => {
  const duration = 0.1;
  const squareWave = new WaveBuilder(Note.B).expTo(Note.D, 0.1).build();

  const gainNode = new GainBuilder(0).linerTo(0.5, duration / 2).build();

  squareWave.connect(gainNode);

  gainNode.connect(audioContext.destination);

  squareWave.start();
  squareWave.stop(audioContext.currentTime + duration);
};

export const playClearSound = () => {
  const duration = 0.5;
  const squareWave = new WaveBuilder(Note.C)
    .linerTo(Note.E, 0.1)
    .linerTo(Note.G, 0.3)
    .build();

  const gainNode = new GainBuilder(0.5).linerTo(0, duration).build();

  squareWave.connect(gainNode);

  gainNode.connect(audioContext.destination);

  squareWave.start();
  squareWave.stop(audioContext.currentTime + duration);
};

export const playGameOverSound = () => {
  const duration = 0.7;
  const squareWave = new WaveBuilder(Note.B)
    .expTo(Note.G, 0.1)
    .expTo(Note.E, 0.4)
    .expTo(Note.D, 0.6)
    .build();

  const gainNode = new GainBuilder(0.5).linerTo(0, duration).build();

  squareWave.connect(gainNode);

  gainNode.connect(audioContext.destination);

  squareWave.start();
  squareWave.stop(audioContext.currentTime + duration);
};
