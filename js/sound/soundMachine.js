export class SoundMachine {
  constructor() {
    this.scale;
    this.mixer;
    this.reverb;
    this.soundObjects = [];
    this.muted = true;

    this.initializeAudio();
  }

  playNote(noteIndex) {
    if (this.muted) return;

    if (isNaN(noteIndex) || noteIndex >= this.soundObjects.length) return;

    const { synth, note } = this.soundObjects[noteIndex];
    synth.triggerAttackRelease(note, 0.1);
  }

  playDrum() {
    if (this.muted) return;

    const synth = new Tone.MembraneSynth().toDestination();
    synth.triggerAttackRelease("C2", "8n");
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
    let flavour = "minor pentatonic";
    // let flavour = "major pentatonic";
    this.scale = Tonal.Scale.get("C3 " + flavour).notes;
    this.scale = this.scale.concat(Tonal.Scale.get("C4 " + flavour).notes);
    // scale = scale.concat(Tonal.Scale.get("C5 " + flavour).notes);

    // optional but fun: shuffle the scale array to mixup the notes
    // Tonal.Collection.shuffle(scale);

    // create as many pendulums as we have notes in the scale[] array
    for (let i = 0; i < this.scale.length; i++) {
      let synth = new Tone.Synth();
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
