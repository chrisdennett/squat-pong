import { SoundMachine } from "./js/sound/soundMachine.js";

const controlPanel = document.querySelector("#controlPanel");
const playerTracker = document.querySelector("#tracker");
const soundMachine = new SoundMachine();

/**
this.canvas = document.querySelector("#canvas");
canvas.width = 800;
canvas.height = 600;
this.ctx = canvas.getContext("2d", { willReadFrequently: true });
this.ctx.clearRect(0, 0, canvas.width, canvas.height);

const paddleH = 50;
    console.log("paddleH: ", paddleH);
    const range = canvas.height - paddleH;
    const paddleY = this.playerOneMarker.y * range;
    info.innerHTML = this.playerOneMarker.y;
    this.ctx.fillRect(10, paddleY, 30, paddleH);
*/

document.addEventListener("keyup", (e) => {
  if (e.key === "b") {
    if (controlPanel.style.display === "none") {
      controlPanel.style.display = "inherit";
    } else {
      controlPanel.style.display = "none";
    }
  }

  soundMachine.playNote(parseInt(e.key));
});

function loop() {
  playerTracker.update();

  // const { p1, p2 } = playerTracker.normalisedPlayerPositions;

  // if (p1.isFound) {
  //   // console.log("p1.y: ", p1.y);
  //   //
  // }

  // if (p2.isFound) {
  //   //
  // }

  window.requestAnimationFrame(loop);
}

loop();
