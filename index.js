import { PoseTracker } from "./js/poseTracking/poseTracker.js";
import { SoundMachine } from "./js/sound/soundMachine.js";
import { calculateFPS } from "./js/utils/fps.js";

const pong = document.querySelector("#pong");
const soundMachine = new SoundMachine();

const poseTracker = new PoseTracker();

document.addEventListener("keyup", (e) => {
  const asNum = parseInt(e.key);

  if (!isNaN(asNum)) {
    soundMachine.onNumPress(asNum);
  }

  if (e.key === "b") {
    if ((playerTracker.style.opacity = 0)) {
      playerTracker.style.opacity = 1;
    } else {
      playerTracker.style.width = 0;
    }
  }

  if (e.key === "v") {
    soundMachine.toggleSound();
  }

  // Game settings
  if (e.key === "q") {
    // set player one upper pos
    poseTracker.p1Tracker.setMinY();
  }
  if (e.key === "a") {
    // set player one lower pos
    poseTracker.p1Tracker.setMaxY();
  }
  if (e.key === "e") {
    // set player one upper pos
    poseTracker.p2Tracker.setMinY();
  }
  if (e.key === "d") {
    // set player one lower pos
    poseTracker.p2Tracker.setMaxY();
  }

  // Restart game
  if (pong.state === "gameOver") {
    pong.start();
  }

  // sound testing
  // soundMachine.playNote(parseInt(e.key));
});

// game loop
function loop(timeStamp) {
  calculateFPS(timeStamp);

  // const { p1Tracker, p2Tracker } = poseTracker;
  // let p1HandsUp = p1Tracker.leftHandY < p1Tracker.y;
  // let p2HandsUp = p1Tracker.rightHandY < p1Tracker.y;

  pong.loop();

  if (pong.gameMode !== "demo") {
    pong.setPaddleOneY(p1Tracker.y);
  }

  if (pong.gameMode === "twoPlayer") {
    pong.setPaddleTwoY(p2Tracker.y);
  }

  window.requestAnimationFrame(loop);
}

// kick off
pong.setup({}, soundMachine);
pong.start();
loop();

// listeners
pong.addEventListener("paddleStrike", (e) => {
  // 0 to 1 into int between 0 and 9 inclusive
  const fraction = (e.detail.offsetAsFraction + 1) / 2;
  // const inverse = 1 - fraction;
  const fractionFromCenter = Math.abs(e.detail.offsetAsFraction);
  soundMachine.setOscillatorFromFraction(fractionFromCenter);
});

pong.addEventListener("wallStrike", (e) => {
  // const noteIndex = Math.round(e.detail.offset * 9);
  // soundMachine.playNote(noteIndex);
  soundMachine.updateNotes();
  // soundMachine.randomiseNotes();
});

pong.svgPong.addEventListener("beatBarHit", (e) => {
  // const i = e.target.detail.index;
  soundMachine.playNote(e.detail.note);
});
