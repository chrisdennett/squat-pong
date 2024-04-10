import { PoseTracker } from "./js/poseTracking/poseTracker.js";
import { SoundMachine } from "./js/sound/soundMachine.js";
// import { calculateFPS } from "./js/utils/fps.js";

const pong = document.querySelector("#pong");
const soundMachine = new SoundMachine();

const poseTracker = new PoseTracker();
const pose1Canvas = document.getElementById("pose1Canvas");
const pose2Canvas = document.getElementById("pose2Canvas");

document.addEventListener("keyup", (e) => {
  if (e.key === "b") {
    if ((playerTracker.style.opacity = 0)) {
      playerTracker.style.opacity = 1;
    } else {
      playerTracker.style.width = 0;
    }
  }

  if (e.key === "v") {
    soundMachine.muted = !soundMachine.muted;
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
  soundMachine.playNote(parseInt(e.key));
});

// game loop
function loop() {
  poseTracker.detectLandmarks();
  const { p1Tracker, p2Tracker } = poseTracker;
  poseTracker.drawPlayers(pose1Canvas, pose2Canvas);

  pong.loop();

  if (pong.gameMode !== "demo") {
    pong.setPaddleOneY(p1Tracker.y);
  }

  if (pong.gameMode === "twoPlayer") {
    pong.setPaddleTwoY(p2Tracker.y);
  }

  if (p1Tracker.leftHandY < p1Tracker.y || p1Tracker.rightHandY < p1Tracker.y) {
    console.log("left hand up");
    soundMachine.useSawtooth();
  } else {
    soundMachine.useSine();
  }

  soundMachine.frequency1 = pong.paddleOneY;
  soundMachine.frequency2 = pong.paddleTwoY;

  // Calculate and display FPS
  // calculateFPS();

  window.requestAnimationFrame(loop);
}

// kick off
pong.setup();
pong.start();
loop();

// listeners
pong.addEventListener("paddleStrike", (e) => {
  const fraction = (e.detail.offsetAsFraction + 1) / 2;
  const inverse = 1 - fraction;

  // 0 to 1 into int between 0 and 9 inclusive
  const noteIndex = Math.round(inverse * 9);
  soundMachine.playNote(noteIndex);
});

pong.addEventListener("wallStrike", (e) => {
  const noteIndex = Math.round(e.detail.offset * 9);
  soundMachine.playNote(noteIndex);
});
