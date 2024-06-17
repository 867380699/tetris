import { noteTable } from "./note";

export const playMainThemeMusic = () => {
  return new Promise((resolve) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();

    // Define the parameters for the tune
    const bpm = 480; // Beats per minute
    const noteDuration = 60 / bpm; // Duration of each note in seconds

    const sopranoMelody: { note: number; duration: number }[] = [];

    (
      `E5,4|B4,8|C5,8|D5,8|E5,16|D5,16|C5,8|B4,8
         A4,4|A4,8|C5,8|E5,4|D5,8|C5,8
         B4,2.666666666|C5,8|D5,4|E5,4
         C5,4|A4,4|A4,2
         rest,8|D5,4|F5,8|A5,4|G5,8|F5,8
         E5,2.666666666|C5,8|E5,4|D5,8|C5,8
         B4,4|B4,8|C5,8|D5,4|E5,4
         C5,4|A4,4|A4,4|rest,4`
        .replace(/\n/g, "|")
        .replace(/\s/g, "")
        .split("|")
        .map((s) => s.split(","))
        .map(([n, d]) => [n, parseFloat(d)]) as [
        keyof typeof noteTable,
        number,
      ][]
    ).forEach(([note, duration]) =>
      sopranoMelody.push({ note: noteTable[note], duration: 16 / duration }),
    );

    const altoMelody: { note: number; duration: number }[] = [];

    (
      `B4,4|G#4,8|A4,8|B4,8|rest,8|A4,8|G#4,8
         E4,4|E4,8|A4,8|C5,4|B4,8|A4,8
         G#4,8|E4,8|G#4,8|A4,8|B4,4|C5,4
         A4,4|E4,4|E4,2
         rest,8|F4,4|A4,8|C5,8|C5,16|C5,16|B4,8|A4,8
         G4,2.666666666|E4,8|G4,8|A4,16|G4,16|F4,8|E4,8
         G#4,8|E4,8|G#4,8|A4,8|B4,8|G#4,8|B4,8|G#4,8
         A4,8|E4,8|E4,4|E4,4|rest,4`
        .replace(/\n/g, "|")
        .replace(/\s/g, "")
        .split("|")
        .map((s) => s.split(","))
        .map(([n, d]) => [n, parseFloat(d)]) as [
        keyof typeof noteTable,
        number,
      ][]
    ).forEach(([note, duration]) =>
      altoMelody.push({ note: noteTable[note], duration: 16 / duration }),
    );

    const bassMelody: { note: number; duration: number }[] = [];

    (
      `E2,8|E3,8|E2,8|E3,8|E2,8|E3,8|E2,8|E3,8
         A2,8|A3,8|A2,8|A3,8|A2,8|A3,8|A2,8|A3,8
         G#2,8|G#3,8|G#2,8|G#3,8|E2,8|E3,8|E2,8|E3,8
         A2,8|A3,8|A2,8|A3,8|A2,8|A3,8|B2,8|C3,8
         D3,8|D2,8|rest,8|D2,8|rest,8|D2,8|A2,8|F2,8
         C2,8|C3,8|rest,8|C3,8|C2,8|G2,8|rest,8|G2,8
         B2,8|B3,8|rest,8|B3,8|rest,8|E3,8|rest,8|G#3,8
         A2,8|E2,8|A2,8|E2,8|A2,4|rest,4`
        .replace(/\n/g, "|")
        .replace(/\s/g, "")
        .split("|")
        .map((s) => s.split(","))
        .map(([n, d]) => [n, parseFloat(d)]) as [
        keyof typeof noteTable,
        number,
      ][]
    ).forEach(([note, duration]) =>
      bassMelody.push({ note: noteTable[note], duration: 16 / duration }),
    );

    const tuneDuration =
      noteDuration * sopranoMelody.reduce((a, b) => a + b.duration, 0);

    const sopranoNode = audioContext.createOscillator();
    sopranoNode.type = "square";

    const altoNode = audioContext.createOscillator();
    altoNode.type = "square";

    const bassNode = audioContext.createOscillator();
    bassNode.type = "triangle";

    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

    sopranoNode.connect(gainNode);
    altoNode.connect(gainNode);
    bassNode.connect(gainNode);
    gainNode.connect(audioContext.destination);

    let currentTime = audioContext.currentTime;
    sopranoMelody.forEach((note) => {
      const duration = noteDuration * note.duration;
      sopranoNode.frequency.setValueAtTime(note.note, currentTime);

      currentTime += duration;
    });

    currentTime = audioContext.currentTime;
    altoMelody.forEach((note) => {
      const duration = noteDuration * note.duration;
      altoNode.frequency.setValueAtTime(note.note, currentTime);

      currentTime += duration;
    });

    currentTime = audioContext.currentTime;
    bassMelody.forEach((note) => {
      const duration = noteDuration * note.duration;
      bassNode.frequency.setValueAtTime(note.note, currentTime);

      currentTime += duration;
    });
    sopranoNode.start(audioContext.currentTime);
    sopranoNode.stop(audioContext.currentTime + tuneDuration);
    altoNode.start(audioContext.currentTime);
    altoNode.stop(audioContext.currentTime + tuneDuration);
    bassNode.start(audioContext.currentTime);
    bassNode.stop(audioContext.currentTime + tuneDuration);

    sopranoNode.onended = () => {
      resolve(true);
      console.log('bgm "soprano" ended', audioContext.close);
      audioContext.close();
    };
  });
};
