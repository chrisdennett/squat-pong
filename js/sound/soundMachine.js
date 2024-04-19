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
    this.totalNotes = this.noteOptions.length;
    this.currOctaveList = ["3", "4", "5", "4", "3"];
    this.currNoteIndex = 0;
    this.currNote = this.noteOptions[this.currNoteIndex];

    this.notes = this.currOctaveList.map((o) => this.getNoteObject(o));
    this.noteObjects = [];

    this.maxNoteObjects = this.notes.length * 2;
    this.currNoteObjIndex = 0;

    // this.oscillatorOptions = ["sine", "triangle", "square", "sawtooth"];
    this.oscillatorOptions = ["sine", "sine", "triangle"];
    this.currOscillator = this.oscillatorOptions[0];

    this.attack = 0.3;
    this.decay = 0.9;
    this.sustain = 0.9;
    this.release = 0.8;
    this.noteLength = 0.2;
  }

  setNextNote() {
    this.currNoteIndex++;

    if (this.currNoteIndex >= this.totalNotes) {
      this.currNoteIndex = 0;
    }
    this.currNote = this.noteOptions[this.currNoteIndex];

    this.notes = this.currOctaveList.map((o) => this.getNoteObject(o));
  }

  getNoteObject(octave) {
    const name = this.currNote + octave;
    const freq = Tonal.Note.freq(name);
    return { name, octave, freq };
  }

  setOscillatorFromFraction(fraction) {
    const index = Math.round(fraction * (this.oscillatorOptions.length - 1));
    this.currOscillator = this.oscillatorOptions[index];

    if (!this.currOscillator) {
      console.log("index: ", index);
    }
  }

  setRandomOscillator() {
    this.currOscillator = getRandomArrayItem(this.oscillatorOptions);
  }

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
      // toggle
      this.useRandomOscillator = !this.useRandomOscillator;
    }
  }

  changeOscillator() {
    const currIndex = this.oscillatorOptions.findIndex(
      (o) => o === this.currOscillator
    );
    const nextIndex =
      currIndex === this.oscillatorOptions.length - 1 ? 0 : currIndex + 1;
    this.currOscillator = this.oscillatorOptions[nextIndex];
  }

  toggleSound() {
    this.muted ? this.play() : this.pause();
  }

  pause() {
    this.muted = true;
  }

  play() {
    this.muted = false;
  }

  playNote(noteIndex) {
    if (this.muted) return;

    if (isNaN(noteIndex) || noteIndex >= this.notes.length) return;

    // reuse to prevent too many being created
    let noteObj = this.noteObjects[this.currNoteObjIndex];
    if (!noteObj) {
      noteObj = {};
    }
    this.noteObjects[this.currNoteObjIndex] = noteObj;

    // clean up
    if (noteObj.env) {
      noteObj.env.disconnect();
      noteObj.env.dispose();
    }
    if (noteObj.osc) {
      noteObj.osc.disconnect();
      noteObj.osc.dispose();
    }

    // Create new sound
    noteObj.env = new Tone.AmplitudeEnvelope({
      attack: this.attack,
      decay: this.decay,
      sustain: this.sustain,
      release: this.release,
    }).toDestination();

    noteObj.osc = new Tone.Oscillator(
      this.notes[noteIndex].freq,
      this.currOscillator
    );
    noteObj.osc.connect(noteObj.env);
    noteObj.osc.start();
    noteObj.env.triggerAttackRelease(this.noteLength);

    // deal with current object to reuse
    this.currNoteObjIndex++;
    if (this.currNoteObjIndex >= this.maxNoteObjects) {
      this.currNoteObjIndex = 0;
    }
  }

  // playDrum() {
  //   if (this.muted) return;

  //   const synth = new Tone.MembraneSynth().toDestination();
  //   synth.triggerAttackRelease("C2", 1);
  //   // synth.triggerAttackRelease("C2", "8n");
  // }
}
