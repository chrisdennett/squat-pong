import { BrushStrokeEffect } from "./js/growingBrushStrokes/BrushStrokeEffect.js";
import { WebcamPlayerTracker } from "./js/playerTracking/WebcamPlayerTracker.js";

const controlPanel = document.querySelector("#controlPanel");
// controlPanel.style.display = "none";
const playerTracker = new WebcamPlayerTracker();
const brushStrokeEffect = new BrushStrokeEffect();

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

  if (e.key === "c") {
    brushStrokeEffect.clearCanvas();
  }
});

function loop() {
  brushStrokeEffect.fadeCanvas();
  playerTracker.update();

  const { p1 } = playerTracker.normalisedPlayerPositions;
  if (p1.markerFound) {
    brushStrokeEffect.triggerRoot(
      p1.x * brushStrokeEffect.canvas.width,
      p1.y * brushStrokeEffect.canvas.height
    );
  }

  window.requestAnimationFrame(loop);
}

loop();
