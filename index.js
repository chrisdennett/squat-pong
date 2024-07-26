import { PoseTracker } from "./js/poseTracking/poseTracker.js";
import { playInstruction } from "./js/sound/soundFilePlayer.js";
import { SoundMachine } from "./js/sound/soundMachine.js";
import { calculateFPS } from "./js/utils/fps.js";

const rallyTextHolder = document.getElementById("rallyTextHolder");
const rallyTallyScoreText = document.getElementById("rallyTallyScore");
const bestRallyScoreText = document.getElementById("bestRallyScore");
const player1Text = document.getElementById("player1Text");
const player2Text = document.getElementById("player2Text");
const gameText = document.getElementById("gameText");
const gameInstruction = document.getElementById("gameInstruction");
const pausedModal = document.getElementById("pausedModal");
const pausedCountdown = document.getElementById("pausedCountdown");
const player1Overlay = document.getElementById("player1Overlay");
const player2Overlay = document.getElementById("player2Overlay");

const pong = document.querySelector("#pong");
const soundMachine = new SoundMachine();

// const gameStates = {
//   0: "awaitingPlayers",
//   1: "playersAvailable",
//   2: "calibration",
//   3: "playingGame",
//   4: "gameOver",
//   5: "demoMode",
// };

let gameState = "awaitingPlayers";
let prevGameState = gameState;
let bestRallyScore = 0;

const poseTracker = new PoseTracker();

document.addEventListener("keyup", (e) => {
  const asNum = parseInt(e.key);

  if (!isNaN(asNum)) {
    soundMachine.playNote(asNum);
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

let pauseCount = 0;
const maxPauseCount = 3 * 60; // five seconds assuming 60fps
let currentTimers = [];

// game loop
function loop(timeStamp) {
  calculateFPS(timeStamp);

  const { p1Tracker, p2Tracker } = poseTracker;

  updateRallyText();

  // PLAYER ONE
  updatePlayerPresence(1, p1Tracker.isDetected);

  // PLAYER TWO
  updatePlayerPresence(2, p2Tracker.isDetected);

  // game selection phase
  if (gameState === "awaitingPlayers" || gameState === "playersAvailable") {
    updateGameState(p1Tracker, p2Tracker);
  }

  // calibration phase
  if (gameState === "startCalibration") {
    startCalibration(p1Tracker, p2Tracker);
  }

  // if neither tracker is detected set as paused
  if (
    !p1Tracker.isDetected &&
    !p2Tracker.isDetected &&
    gameState !== "awaitingPlayers"
  ) {
    if (gameState !== "paused") {
      prevGameState = gameState;
    }
    gameState = "paused";
  } else {
    if (gameState === "paused") {
      gameState = prevGameState;
    }
  }

  // if paused
  if (gameState === "paused") {
    pong.isPaused = true;
    pausedModal.style.opacity = 1;
    pauseCount++;

    pausedCountdown.innerHTML = `Game will reset in ${Math.round(
      (maxPauseCount - pauseCount) / 60
    )} seconds`;
    // if no player for full 5 seconds, reset to beginning
    if (pauseCount === maxPauseCount) {
      resetGame();
    }
  } else {
    pong.isPaused = false;
    pausedModal.style.opacity = 0;
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

pong.addEventListener("gameOver", (e) => {
  runFunctionAfterCountdown("", 5, () => {
    resetGame();
  });
});

function updateRallyText() {
  // don't change the tally if in demo mode.
  if (pong.gameMode === "demo") return;

  rallyTallyScoreText.innerHTML = pong.rallyTally;
  if (pong.rallyTally > bestRallyScore) {
    bestRallyScore = pong.rallyTally;
    bestRallyScoreText.innerHTML = bestRallyScore;
  }
}

function resetGame() {
  gameState = "awaitingPlayers";
  pong.isPaused = false;
  pauseCount = 0;
  clearTimers();
  pong.reset();
  gameText.style.opacity = 1;
  gameInstruction.style.opacity = 1;
  pausedModal.style.opacity = 0;
}

function clearTimers() {
  for (let t of currentTimers) {
    window.clearInterval(t);
  }
  currentTimers = [];
}

function startCalibration() {
  /**
  When hands are lifted enter a calibration mode.
  Entering Calibration Phase, leave screen to cancel.
 */
  // Step 1
  playInstruction("gong");
  gameState = "calibrating";
  gameInstruction.innerHTML = "Leave screen to reset.";

  // start calibration
  runFunctionAfterCountdown("CALIBRATE IN", 3, () => {
    // setting top marker
    playInstruction("gong");
    runFunctionAfterCountdown("STAND</br>STILL</br>for", 3, () => {
      poseTracker.p1Tracker.setMinY();
      poseTracker.p2Tracker.setMinY();

      // setting bottom marker
      playInstruction("gong");
      runFunctionAfterCountdown("SQUAT</br>&HOLD</br> for", 3, () => {
        poseTracker.p1Tracker.setMaxY();
        poseTracker.p2Tracker.setMaxY();

        // Start game
        playInstruction("gong");
        runFunctionAfterCountdown("GAME STARTING", 1, () => {
          gameText.style.opacity = 0;
          gameInstruction.style.opacity = 0;
          pong.start();
          rallyTextHolder.style.display = "inherit";
        });
      });
    });
  });
}

function runFunctionAfterCountdown(text, max, callback) {
  clearTimers();
  if (gameState === "paused") return;

  let count = max;
  gameText.innerHTML = `${text} ${count}`;

  const timer1 = setInterval(() => {
    // wait if paused
    if (gameState === "paused") return;

    count--;
    gameText.innerHTML = `${text} ${count}`;

    if (count <= 0) {
      clearInterval(timer1);
      callback();
    }
  }, 1000);

  currentTimers.push(timer1);
}

function updateGameState(p1Tracker, p2Tracker) {
  const p1Detected = p1Tracker.isDetected;
  const p2Detected = p2Tracker.isDetected;

  if (p1Detected && p1Tracker.bothHandsAreUp) {
    gameState = "startCalibration";
    return;
  }

  pong.hideNetAndBall();
  rallyTextHolder.style.display = "none";

  // PLAYER ONE
  updatePlayerPresence(1, p1Detected);

  // PLAYER TWO
  updatePlayerPresence(2, p2Detected);

  // game text
  if (p1Detected && p2Detected) {
    // 2 player mode
    gameText.innerHTML = "2 Player Mode";
    gameInstruction.innerHTML =
      "Either player put your hands above head to start.";
    pong.setTo2PlayerMode();
  } else if (p1Detected) {
    // 1 player mode
    gameText.innerHTML = "One Player Mode";
    gameInstruction.innerHTML =
      "Put your hands above head to start  or wait for opponent.";
    pong.setTo1PlayerMode();
  } else {
    // demo mode
    gameText.innerHTML = "Step up Player One";
    gameInstruction.innerHTML = "";
    pong.setToDemoMode();
  }
}

function updatePlayerPresence(player, isDetected) {
  const text = player === 1 ? player1Text : player2Text;
  const overlay = player === 1 ? player1Overlay : player2Overlay;

  if (isDetected) {
    text.style.background = "hsl(28, 88%, 33%)";
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
