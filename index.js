import { PoseTracker } from "./js/poseTracking/poseTracker.js";
import { SoundMachine } from "./js/sound/soundMachine.js";
import { calculateFPS } from "./js/utils/fps.js";

const player1Text = document.getElementById("player1Text");
const player2Text = document.getElementById("player2Text");
const pose1Canvas = document.getElementById("pose1Canvas");
const pose2Canvas = document.getElementById("pose2Canvas");

const pong = document.querySelector("#pong");
const soundMachine = new SoundMachine();

const gameStates = {
  0: "awaitingPlayers",
  1: "playersAvailable",
  2: "calibration",
  3: "playingGame",
  4: "gameOver",
  5: "demoMode",
};

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

  // test instruction
  if (e.key === "p") {
    soundMachine.playInstruction();
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

  const { p1Tracker, p2Tracker } = poseTracker;

  if (p1Tracker.isDetected) {
    player1Text.style.background = "#ff7800";
    player1Text.innerHTML = "PLAYER ONE";
    player1Text.style.color = "white";
    pose1Canvas.style.filter = "grayscale(0)";
  } else {
    player1Text.style.background = "black";
    player1Text.innerHTML = "AWAITING PLAYER";
    player1Text.style.color = "gray";
    pose1Canvas.style.filter = "grayscale(1)";
  }

  if (p2Tracker.isDetected) {
    player2Text.style.background = "#ff7800";
    player2Text.innerHTML = "PLAYER TWO";
    player2Text.style.color = "white";
    pose2Canvas.style.filter = "grayscale(0)";
  } else {
    player2Text.style.background = "black";
    player2Text.style.color = "gray";
    player2Text.innerHTML = "AWAITING PLAYER";
    pose2Canvas.style.filter = "grayscale(1)";
  }
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
// pong.start();
loop();

// listeners
pong.addEventListener("paddleStrike", (e) => {
  // 0 to 1 into int between 0 and 9 inclusive
  // const fraction = (e.detail.offsetAsFraction + 1) / 2;
  // const inverse = 1 - fraction;
  const fractionFromCenter = Math.abs(e.detail.offsetAsFraction);
  soundMachine.setOscillatorFromFraction(fractionFromCenter);
});

pong.addEventListener("wallStrike", (e) => {
  // const noteIndex = Math.round(e.detail.offset * 9);
  // soundMachine.playNote(noteIndex);
  soundMachine.setNextNote();
});

pong.svgPong.addEventListener("beatBarHit", (e) => {
  // const i = e.target.detail.index;
  soundMachine.playNote(e.detail.index);
});
