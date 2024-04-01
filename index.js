import { PoseTracker } from "./js/poseTracking/poseTracker.js";
import { SoundMachine } from "./js/sound/soundMachine.js";
import { calculateFPS } from "./js/utils/fps.js";

// const playerTracker = document.querySelector("#tracker");
const pong = document.querySelector("#pong");
const soundMachine = new SoundMachine();

const poseCanvas = document.getElementById("poseCanvas");
poseCanvas.width = 320;
poseCanvas.height = 240;
poseCanvas.style.border = "1px solid yellow";
const poseCtx = poseCanvas.getContext("2d");
const poseTracker = new PoseTracker();

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

// function drawPose() {
//   const data = handsfree.data;
//   if (!data.pose) return;
//   const img = data.pose.image;
//   poseCtx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 320, 240);

//   const marks = data.pose.poseLandmarks;
//   if (!marks || marks.length === 0) {
//     return;
//   }

//   for (let i = 0; i < marks.length; i++) {
//     let colour = i === 0 ? "red" : "black";
//     const m = marks[i];
//     poseCtx.fillStyle = colour;
//     poseCtx.fillRect(m.x * 320, m.y * 240, 7, 7);
//   }
// }

// function getNosePos() {
//   if (
//     !handsfree.data ||
//     !handsfree.data.pose ||
//     !handsfree.data.pose.poseLandmarks
//   ) {
//     return { x: 0, y: 0 };
//   }

//   return handsfree.data.pose.poseLandmarks[0];
// }

// game loop
function loop() {
  // playerTracker.update();
  poseTracker.detectLandmarks();
  poseTracker.drawLandmarks();
  // poseTracker.update();

  pong.loop();

  // const { p1, p2 } = playerTracker.normalisedPlayerPositions;
  // const p1 = getNosePos();

  // if (p1.isFound) {
  // pong.setPaddleOneY(p1.y);
  // }

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
