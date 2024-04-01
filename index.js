import { PoseTracker } from "./js/poseTracking/poseTracker.js";
import { SoundMachine } from "./js/sound/soundMachine.js";
import { calculateFPS } from "./js/utils/fps.js";

const pong = document.querySelector("#pong");
const soundMachine = new SoundMachine();

const poseTracker = new PoseTracker();
const poseCanvas = document.getElementById("poseCanvas");

const poseCtx = poseCanvas.getContext("2d");

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

function drawPose(video, p1Tracker, p2Tracker) {
  poseCanvas.width = poseTracker.width;
  poseCanvas.height = poseTracker.height;
  poseCtx.drawImage(video, 0, 0);

  if (p1Tracker.landmarks.length > 0) {
    for (let i = 0; i < p1Tracker.landmarks.length; i++) {
      let colour = i === 0 ? "red" : "black";
      const m = p1Tracker.landmarks[i];
      poseCtx.fillStyle = colour;
      poseCtx.fillRect(m.x * poseCanvas.width, m.y * poseCanvas.height, 7, 7);
    }
  }

  if (p2Tracker.landmarks.length > 0) {
    for (let i = 0; i < p2Tracker.landmarks.length; i++) {
      let colour = i === 0 ? "red" : "black";
      const m = p2Tracker.landmarks[i];
      poseCtx.fillStyle = colour;
      poseCtx.fillRect(m.x * poseCanvas.width, m.y * poseCanvas.height, 7, 7);
    }
  }

  // draw boundaries
  poseCtx.fillStyle = "yellow";
  const halfX = poseCanvas.width / 2;
  poseCtx.fillRect(0, poseTracker.p1Tracker.minY * poseCanvas.height, halfX, 2);
  poseCtx.fillRect(0, poseTracker.p1Tracker.maxY * poseCanvas.height, halfX, 2);

  poseCtx.fillRect(
    halfX,
    poseTracker.p2Tracker.minY * poseCanvas.height,
    halfX,
    2
  );
  poseCtx.fillRect(
    halfX,
    poseTracker.p2Tracker.maxY * poseCanvas.height,
    halfX,
    2
  );
}

// game loop
function loop() {
  poseTracker.detectLandmarks();
  const { p1Tracker, p2Tracker } = poseTracker;
  drawPose(poseTracker.getVideo(), p1Tracker, p2Tracker);

  pong.loop();

  pong.setPaddleOneY(p1Tracker.y);
  pong.setPaddleTwoY(p2Tracker.y);

  // Calculate and display FPS
  calculateFPS();

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
