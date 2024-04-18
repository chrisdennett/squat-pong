// https://www.youtube.com/watch?v=hgg3ZBLRH58
// this one looks really promising (code: https://jsfiddle.net/dirklo/m30n1w6c/) article below.
// https://medium.com/geekculture/building-a-modular-synth-with-web-audio-api-and-javascript-d38ccdeca9ea

// Theremin
//medium.com/jit-team/how-to-create-a-musical-instrument-with-no-notes-using-javascript-ec6a83333aa4

// tone.js squelchy sound
// https://medium.com/dev-red/tutorial-lets-make-music-with-javascript-and-tone-js-f6ac39d95b8c
import { getRandomArrayItem } from "../utils/helpers.js";

export class SoundMachine {
  constructor() {
    this.muted = false;
    this.octave = "3";
    this.noteOptions = [
      "C",
      "G",
      "D",
      "A",
      "E",
      "B",
      "Gb",
      "Db",
      "Ab",
      "Eb",
      "Bb",
      "F",
    ];
    // const noteNames = ["c", "c", "c", "c", "c"];
    this.octaveOptions = [3, 4, 5, 4, 3];

    /**
     For every octave option create an array of note objects
     for every note option.
     */
    this.noteInfoList = [];
    for (let n of this.noteOptions) {
      const noteOctaves = [];
      for (let o of this.octaveOptions) {
        noteOctaves.push(this.getNoteObject(n, o));
      }
      this.noteInfoList.push(noteOctaves);
    }

    this.totalNotes = this.octaveOptions * this.noteOptions;

    this.notes = this.noteInfoList[0];
    this.noteObjects = [];
    this.maxNoteObjects = this.totalNotes * 2;
    this.currNoteObjIndex = 0;

    this.oscillatorOptions = ["sine", "triangle", "square", "sawtooth"];
    this.oscillatorType = this.oscillatorOptions[0];
    this.attack = 0.3;
    this.decay = 0.9;
    this.sustain = 0.9;
    this.release = 0.8;
    this.noteLength = 0.1;
  }

  // getNoteBasedOn

  getNoteObject(note, octave) {
    const name = note + octave;
    const freq = Tonal.Note.freq(name);
    return { note, name, octave, freq };
  }

  setOscillatorFromFraction(fraction) {
    /**
    if 0 or 1 - sawtooth
    if 0.5 - sine
     */

    const index = Math.round(fraction * (this.oscillatorOptions.length - 1));
    this.oscillatorType = this.oscillatorOptions[index];

    if (!this.oscillatorType) {
      console.log("index: ", index);
    }
  }

  // setRandomOscillator() {
  //   this.oscillatorType = getRandomArrayItem(this.oscillatorOptions);
  // }

  onNumPress(num) {
    if (num === 1) {
      this.changeOscillator();
    }

    if (num === 2) {
      // randomise attack
      // this.attack = Math.random();
      // this.decay = Math.random();
      // this.sustain = Math.random();
      // this.release = Math.random();
      this.noteLength = Math.random() * 0.4 + 0.2;
    }

    if (num === 3) {
      this.randomiseNotes();
    }

    if (num === 4) {
    }
  }

  // randomiseNotes() {
  //   const total = this.notes.length;
  //   for (let i = 0; i < total; i++) {
  //     const noteName = getRandomArrayItem(this.noteOptions);
  //     const randOctave = getRandomArrayItem(this.octaveOptions);
  //     const ocs = getRandomArrayItem(this.oscillatorOptions);

  //     this.notes[i] = this.getNoteObject(noteName, randOctave, ocs);
  //   }
  // }

  // changeOscillator() {
  //   const currIndex = this.oscillatorOptions.findIndex(
  //     (o) => o === this.oscillatorType
  //   );
  //   const nextIndex =
  //     currIndex === this.oscillatorOptions.length - 1 ? 0 : currIndex + 1;
  //   this.oscillatorType = this.oscillatorOptions[nextIndex];
  // }

  toggleSound() {
    this.muted ? this.play() : this.pause();
  }

  pause() {
    this.muted = true;
  }

  play() {
    this.muted = false;
  }

  playNote(note) {
    if (this.muted) return;

    if (!note) return;

    // clean up
    if (note.env) {
      note.env.disconnect();
      note.env.dispose();
    }
    if (note.osc) {
      note.osc.disconnect();
      note.osc.dispose();
    }

    // Create new sound
    note.env = new Tone.AmplitudeEnvelope({
      attack: this.attack,
      decay: this.decay,
      sustain: this.sustain,
      release: this.release,
    }).toDestination();

    note.osc = new Tone.Oscillator(note.freq, this.oscillatorType);

    note.osc.connect(note.env);
    note.osc.start();
    note.env.triggerAttackRelease(this.noteLength);
  }

  playDrum() {
    if (this.muted) return;

    const synth = new Tone.MembraneSynth().toDestination();
    synth.triggerAttackRelease("C2", 1);
    // synth.triggerAttackRelease("C2", "8n");
  }
}
