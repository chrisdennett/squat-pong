import { SoundMachine } from "./js/sound/soundMachine.js";
import { calculateFPS } from "./js/utils/fps.js";

const playerTracker = document.querySelector("#tracker");
const pong = document.querySelector("#pong");
const soundMachine = new SoundMachine();

document.addEventListener("keyup", (e) => {
  if (e.key === "b") {
    if ((playerTracker.style.opacity = 0)) {
      playerTracker.style.opacity = 1;
    } else {
      playerTracker.style.width = 0;
    }
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

// game loop
function loop() {
  playerTracker.update();

  pong.loop();

  const { p1, p2 } = playerTracker.normalisedPlayerPositions;

  if (p1.isFound) {
    pong.setPaddleOneY(p1.y);
  }

  if (p2.isFound) {
    pong.setPaddleTwoY(p2.y);
  }

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
  soundMachine.playNote(9);
});
