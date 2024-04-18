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
    this.scale;
    this.mixer;
    this.reverb;
    this.soundObjects = [];
    this.muted = false;
    this.osc1;
    // this.osc2;

    this.frequencyMin = 100;
    this.frequencyMax = 400;
    this.frequencyRange = this.frequencyMax - this.frequencyMin;

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
    const noteNames = ["C", "G", "D", "A", "E", "B", "Gb", "Db", "Ab"];
    // const noteNames = ["A", "E", "B", "Gb", "Db", "Ab"];
    //Note.freq
    this.notes = noteNames.map((n) =>
      this.getNoteObject(n, this.octave, this.oscillatorType)
    );
    this.noteObjects = [];
    this.maxNoteObjects = this.notes.length * 2;
    this.currNoteObjIndex = 0;

    this.oscillatorOptions = ["sine", "triangle", "square", "sawtooth"];
    this.octaveOptions = [2, 3, 4, 5, 6];
    this.oscillatorType = this.oscillatorOptions[0];
    this.attack = 0.3;
    this.decay = 0.9;
    this.sustain = 0.9;
    this.release = 0.8;
    this.noteLength = 0.1;

    this.useRandomOscillator = false;

    // noteObj.env = new Tone.AmplitudeEnvelope({
    //   attack: 0.3,
    //   decay: 0.3,
    //   sustain: 0.8,
    //   release: 0.8,
    // }).toDestination();

    // this.initializeAudio();
    this.initializeOscillators();
  }

  getNoteObject(name, octave, oscillator) {
    const freq = Tonal.Note.freq(name + octave);
    return { name, octave, freq, oscillator };
  }

  setRandomOscillator() {
    this.oscillatorType = getRandomArrayItem(this.oscillatorOptions);
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
      // console.log("this.attack: ", this.attack);
      // console.log(" this.sustain: ", this.sustain);
      // console.log("this.release: ", this.release);
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

  randomiseNotes() {
    const total = this.notes.length;
    for (let i = 0; i < total; i++) {
      const noteName = getRandomArrayItem(this.noteOptions);
      const randOctave = getRandomArrayItem(this.octaveOptions);
      const ocs = getRandomArrayItem(this.oscillatorOptions);

      this.notes[i] = this.getNoteObject(noteName, randOctave, ocs);
    }
  }

  changeOscillator() {
    const currIndex = this.oscillatorOptions.findIndex(
      (o) => o === this.oscillatorType
    );
    const nextIndex =
      currIndex === this.oscillatorOptions.length - 1 ? 0 : currIndex + 1;
    this.oscillatorType = this.oscillatorOptions[nextIndex];
  }

  toggleSound() {
    this.muted ? this.play() : this.pause();
  }

  pause() {
    // this.osc1.stop();
    // this.osc2.stop();
    this.muted = true;
  }

  play() {
    // this.osc1.start();
    // this.osc2.start();
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

    const oscType = this.useRandomOscillator
      ? this.notes[noteIndex].osc
      : this.oscillatorType;

    noteObj.osc = new Tone.Oscillator(this.notes[noteIndex].freq, oscType);

    noteObj.osc.connect(noteObj.env);
    noteObj.osc.start();
    noteObj.env.triggerAttackRelease(this.noteLength);

    // deal with current object to reuse
    this.currNoteObjIndex++;
    if (this.currNoteObjIndex >= this.maxNoteObjects) {
      this.currNoteObjIndex = 0;
    }
  }

  playNoteOLD(noteIndex) {
    if (this.muted) return;

    if (isNaN(noteIndex) || noteIndex >= this.soundObjects.length) return;

    const { synth, note } = this.soundObjects[noteIndex];
    synth.triggerAttackRelease(note, 0.5);
  }

  playDrum() {
    if (this.muted) return;

    const synth = new Tone.MembraneSynth().toDestination();
    synth.triggerAttackRelease("C2", 1);
    // synth.triggerAttackRelease("C2", "8n");
  }

  /**
   * @param {float} fraction
   */
  set frequency1(fraction) {
    if (!this.osc1) return;

    let f = fraction;
    if (f < 0) f = 0;
    if (f > 1) f = 1;

    this.osc1.frequency.value = this.frequencyMin + f * this.frequencyRange;
  }

  set frequency2(fraction) {
    if (!this.osc2) return;
    let f = fraction;
    if (f < 0) f = 0;
    if (f > 1) f = 1;

    this.osc2.frequency.value = this.frequencyMin + f * this.frequencyRange;
  }

  useSawtooth() {
    if (!this.osc1) return;
    // this.oscillatorType = "sawtooth";
    // this.osc1.type = this.oscillatorType;
  }

  useSine() {
    if (!this.osc1) return;
    // this.oscillatorType = "sine";
    // this.osc1.type = this.oscillatorType;
  }

  initializeOscillators() {
    this.osc1 = new Tone.Oscillator();
    this.osc1.type = this.oscillatorType; // sine, triangle, square or sawtooth
    this.osc1.frequency.value = 220; // hz
    this.osc1.volume.value = -15;
    // this.osc1.start();
    this.osc1.toDestination(); // connect the oscillator to the audio output

    this.osc2 = new Tone.Oscillator();
    this.osc2.type = "sine"; // triangle, square or sawtooth
    this.osc2.frequency.value = 220; // hz
    this.osc2.volume.value = -15;
    // this.osc2.start();
    this.osc2.toDestination(); // connect the oscillator to the audio output

    // let lfo = new Tone.LFO(0.1, 200, 240);
    // lfo.connect(osc2.frequency);
    // lfo.start();

    this.waveform = new Tone.Waveform();
    Tone.Master.connect(this.waveform);
    // Tone.Master.volume.value = -15; // -9 decibels

    // let oscType = ["sine", "triangle", "square", "sawtooth"];

    // gui = new dat.GUI();
    // gui.add(osc.frequency, "value", 110, 330).step(0.1).name("frequency");
    // gui.add(osc2.frequency, "value", 110, 330).step(0.1).name("frequency2");
    // gui.add(osc, "type", oscType).name("osc1 type");
    // gui.add(osc2, "type", oscType).name("osc2 type");
  }

  initializeAudio() {
    // Tone.Master.volume.value = -9; // in decibel.

    this.mixer = new Tone.Gain();

    // this.reverb = new Tone.Reverb({
    //   wet: 0.5, // half dry, half wet mix
    //   decay: 10, // decay time in seconds
    // });

    // setup the audio chain:
    // mixer -> reverb -> Tone.Master
    // note that the synth object inside each pendulum get
    // connected to the mixer, so our final chain will look like:
    // synth(s) -> mixer -> reverb -> Tone.Master
    // this.mixer.connect(this.reverb);
    // this.reverb.toDestination();

    this.mixer.toDestination();
    // quick way to get more notes: just glue 3 scales together
    // other 'flavours' to try:
    // major
    // minor
    // major pentatonic
    // the modes (eg: dorian, phrygian, etc..)
    // look at Tonal.ScaleType.names() to see a list of all supported
    // names

    // let flavour = "egyptian";
    // let flavour = "minor pentatonic";
    // let flavour = "major pentatonic";
    // this.scale = Tonal.Scale.get("C4 major pentatonic").notes;
    // this.scale = this.scale.concat(
    //   Tonal.Scale.get("C4 minor pentatonic").notes
    // );
    this.scale = ["C4", "Eb4", "C4", "G4", "Ab4", "G4", "Eb4", "D4"];
    // scale = scale.concat(Tonal.Scale.get("C5 " + flavour).notes);

    // optional but fun: shuffle the scale array to mixup the notes
    // Tonal.Collection.shuffle(scale);

    // create as many pendulums as we have notes in the scale[] array
    for (let i = 0; i < this.scale.length; i++) {
      let synth = new Tone.Synth();
      // let synth = new Tone.MembraneSynth();
      synth.connect(this.mixer);

      this.soundObjects.push({
        synth,
        note: this.scale[i],
        prevTriggerValue: 0,
        delayRetrigger: 0,
      });
    }
  }
}
