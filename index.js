const controlPanel = document.querySelector("#controlPanel");
const playerTracker = document.querySelector("#tracker");
// controlPanel.style.display = "none";

// SOUND STUFF
let scale;
let mixer;
let reverb;
let soundObjects = [];

initializeAudio();

function onKeyDown(e) {
  const noteIndex = parseInt(e.key);
  if (isNaN(noteIndex)) return;

  const { synth, note } = soundObjects[noteIndex];
  synth.triggerAttackRelease(note, 1);
}

/**
this.canvas = document.querySelector("#canvas");
canvas.width = 800;
canvas.height = 600;
this.ctx = canvas.getContext("2d", { willReadFrequently: true });
this.ctx.clearRect(0, 0, canvas.width, canvas.height);

const paddleH = 50;
    console.log("paddleH: ", paddleH);
    const range = canvas.height - paddleH;
    const paddleY = this.playerOneMarker.y * range;
    info.innerHTML = this.playerOneMarker.y;
    this.ctx.fillRect(10, paddleY, 30, paddleH);
*/

document.addEventListener("keyup", (e) => {
  if (e.key === "b") {
    if (controlPanel.style.display === "none") {
      controlPanel.style.display = "inherit";
    } else {
      controlPanel.style.display = "none";
    }
  }

  onKeyDown(e);
});

function loop() {
  playerTracker.update();

  // const { p1, p2 } = playerTracker.normalisedPlayerPositions;

  // if (p1.isFound) {
  //   // console.log("p1.y: ", p1.y);
  //   //
  // }

  // if (p2.isFound) {
  //   //
  // }

  window.requestAnimationFrame(loop);
}

loop();

function initializeAudio() {
  // Tone.Master.volume.value = -9; // in decibel.

  mixer = new Tone.Gain();

  reverb = new Tone.Reverb({
    wet: 0.5, // half dry, half wet mix
    decay: 10, // decay time in seconds
  });

  // setup the audio chain:
  // mixer -> reverb -> Tone.Master
  // note that the synth object inside each pendulum get
  // connected to the mixer, so our final chain will look like:
  // synth(s) -> mixer -> reverb -> Tone.Master
  mixer.connect(reverb);
  reverb.toDestination();

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
  scale = Tonal.Scale.get("C3 " + flavour).notes;
  scale = scale.concat(Tonal.Scale.get("C4 " + flavour).notes);
  // scale = scale.concat(Tonal.Scale.get("C5 " + flavour).notes);

  // optional but fun: shuffle the scale array to mixup the notes
  // Tonal.Collection.shuffle(scale);

  // create as many pendulums as we have notes in the scale[] array
  for (let i = 0; i < scale.length; i++) {
    let synth = new Tone.Synth();
    synth.connect(mixer);

    soundObjects.push({
      synth,
      note: scale[i],
      prevTriggerValue: 0,
      delayRetrigger: 0,
    });
  }
}
