import { PoseTracker } from "./js/poseTracking/poseTracker.js";
import { SoundMachine } from "./js/sound/soundMachine.js";
import { calculateFPS } from "./js/utils/fps.js";

// const playerTracker = document.querySelector("#tracker");
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
    playerTracker.setPlayerOneMinY();
  }
  if (e.key === "a") {
    // set player one lower pos
    playerTracker.setPlayerOneMaxY();
  }
  if (e.key === "e") {
    // set player one upper pos
    playerTracker.setPlayerTwoMinY();
  }
  if (e.key === "d") {
    // set player one lower pos
    playerTracker.setPlayerTwoMaxY();
  }

  // Restart game
  if (pong.state === "gameOver") {
    pong.start();
  }

  // sound testing
  soundMachine.playNote(parseInt(e.key));
});

function drawPose(video, landmarks) {
  poseCanvas.width = poseTracker.width;
  poseCanvas.height = poseTracker.height;
  poseCtx.drawImage(video, 0, 0);

  if (landmarks.landmarks === 0) return;

  const { p1 } = poseTracker;

  for (let i = 0; i < p1.length; i++) {
    let colour = i === 0 ? "red" : "black";
    const m = p1[i];
    poseCtx.fillStyle = colour;
    poseCtx.fillRect(m.x * poseCanvas.width, m.y * poseCanvas.height, 7, 7);
  }
}

// game loop
function loop() {
  // playerTracker.update();
  poseTracker.detectLandmarks();
  // poseTracker.drawLandmarks();
  // poseTracker.update();

  drawPose(poseTracker.getVideo(), poseTracker.landmarks);

  pong.loop();

  pong.setPaddleOneY(poseTracker.nose1Pos.y);

  // if (p2.isFound) {
  //   pong.setPaddleTwoY(p2.y);
  // }

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
