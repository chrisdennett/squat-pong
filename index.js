import { WebcamPlayerTracker } from "./js/WebcamPlayerTracker.js";

const controlPanel = document.querySelector("#controlPanel");
// controlPanel.style.display = "none";

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
});

const playerTracker = new WebcamPlayerTracker();

function loop() {
  playerTracker.update();

  // const { p1 } = playerTracker.normalisedPlayerPositions;
  window.requestAnimationFrame(loop);
}

loop();
