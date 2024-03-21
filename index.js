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

  if (pong.state === "gameOver") {
    pong.start();
  }

  soundMachine.playNote(parseInt(e.key));
});

function loop() {
  playerTracker.update();

  pong.loop();

  const { p1, p2 } = playerTracker.normalisedPlayerPositions;

  if (p1.isFound) {
    pong.setPaddleOneY(p1.y);
  }

  if (p2.isFound) {
    //
  }

  // Calculate and display FPS
  calculateFPS();

  window.requestAnimationFrame(loop);
}

// kick off
pong.setup();
pong.start();
loop();
