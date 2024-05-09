import { PoseTracker } from "./js/poseTracking/poseTracker.js";
import { SoundMachine } from "./js/sound/soundMachine.js";
import { calculateFPS } from "./js/utils/fps.js";

const player1Text = document.getElementById("player1Text");
const player2Text = document.getElementById("player2Text");
const gameText = document.getElementById("gameText");
const gameInstruction = document.getElementById("gameInstruction");
// const pose1Canvas = document.getElementById("pose1Canvas");
// const pose2Canvas = document.getElementById("pose2Canvas");
const player1Overlay = document.getElementById("player1Overlay");
const player2Overlay = document.getElementById("player2Overlay");

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

let gameState = "awaitingPlayers";

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

  if (gameState === "awaitingPlayers" || gameState === "playersAvailable") {
    updateGameState(p1Tracker, p2Tracker);
  }

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

function updateGameState(p1Tracker, p2Tracker) {
  const p1Detected = p1Tracker.isDetected;
  const p2Detected = p2Tracker.isDetected;

  const p1LeftHandUp = p1Tracker.y - p1Tracker.leftHand.y > 0.5;
  const p1RightHandUp = p1Tracker.y - p1Tracker.rightHand.y > 0.5;

  if (p1LeftHandUp && p1RightHandUp) {
    // console.log("p1Tracker.y: ", p1Tracker.y);
    console.log(
      "p1Tracker.y - p1Tracker.leftHand.y: ",
      p1Tracker.y - p1Tracker.leftHand.y
    );
    gameState = "playingGame";
    gameText.style.display = "none";
    gameInstruction.style.display = "none";
    pong.start();
    return;
  }

  pong.hideNetAndBall();

  // PLAYER ONE
  updatePlayerText(1, p1Detected);

  // PLAYER TWO
  updatePlayerText(2, p2Detected);

  // game text
  if (p1Detected && p2Detected) {
    // 2 player mode
    gameText.innerHTML = "2 Player Mode";
    gameInstruction.innerHTML =
      "Either player put your hands above head to start.";
    pong.setTo2PlayerMode();
  } else if (p1Detected) {
    // 1 player mode
    gameText.innerHTML = "1 Player Mode";
    gameInstruction.innerHTML =
      "Put your hands above head to start  or wait for opponent.";
    pong.setTo1PlayerMode();
  } else {
    // demo mode
    gameText.innerHTML = "Demo Mode";
    gameInstruction.innerHTML = "";
    pong.setToDemoMode();
  }
}

function updatePlayerText(player, isDetected) {
  const text = player === 1 ? player1Text : player2Text;
  const overlay = player === 1 ? player1Overlay : player2Overlay;

  if (isDetected) {
    text.style.background = "#ff7800";
    text.innerHTML = player === 1 ? "PLAYER ONE" : "PLAYER TWO";
    text.style.color = "white";
    overlay.style.display = "inherit";
  } else {
    text.style.background = "black";
    text.style.color = "gray";
    text.innerHTML = "AWAITING PLAYER";
    overlay.style.display = "none";
  }
}
