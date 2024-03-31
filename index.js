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

const handsfree = new Handsfree({
  pose: {
    enabled: true,

    // Outputs only the top 25 pose landmarks if true,
    // otherwise shows all 33 full body pose landmarks
    // - Note: Setting this to true may result in better accuracy
    upperBodyOnly: true,

    // Helps reduce jitter over multiple frames if true
    smoothLandmarks: true,

    // Minimum confidence [0 - 1] for a person detection to be considered detected
    minDetectionConfidence: 0.5,

    // Minimum confidence [0 - 1] for the pose tracker to be considered detected
    // Higher values are more robust at the expense of higher latency
    minTrackingConfidence: 0.5,
  },
});

handsfree.enablePlugins("browser");
handsfree.start();

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

// From an event
document.addEventListener("handsfree-data", (event) => {
  const data = event.detail;
  if (!data.pose) return;

  poseCtx.drawImage(data.pose.image, 0, 0);

  for (let m of data.pose.poseLandmarks) {
    poseCtx.fillRect(m.x * 320, m.y * 240, 10, 10);
  }

  // console.log(data.pose.poseLandmarks);
});

// game loop
function loop() {
  // playerTracker.update();

  pong.loop();

  // const { p1, p2 } = playerTracker.normalisedPlayerPositions;

  // if (p1.isFound) {
  //   pong.setPaddleOneY(p1.y);
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
