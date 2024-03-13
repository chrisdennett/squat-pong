/** @type {HTMLCanvasElement}  */

import { Root } from "./Root.js";

export class BrushStrokeEffect {
  constructor() {
    this.canvas = document.querySelector("#canvas");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvasColour = "#83b7b5";

    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.rootsPerTrigger = 3;
    // this.triggerRoot(this.canvas.width / 2, this.canvas.height / 2);
    this.addAllEventListeners();
  }

  triggerRoot(x, y) {
    for (let i = 0; i < this.rootsPerTrigger; i++) {
      const root = new Root(x, y, this.ctx);
      root.update();
    }
  }

  fadeCanvas() {
    this.ctx.globalAlpha = 0.01; // fade rate
    this.ctx.globalCompositeOperation = "destination-out"; // fade out destination pixels
    this.ctx.fillStyle = this.canvasColour;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.globalAlpha = 1; // reset alpha
  }

  //   loop() {
  //     this.ctx.globalAlpha = 0.01; // fade rate
  //     this.ctx.globalCompositeOperation = "destination-out"; // fade out destination pixels
  //     this.ctx.fillStyle = this.canvasColour;
  //     this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  //     this.ctx.globalCompositeOperation = "source-over";
  //     this.ctx.globalAlpha = 1; // reset alpha

  //     requestAnimationFrame(this.loop.bind(this));
  //   }

  clearCanvas() {
    this.ctx.fillStyle = this.canvasColour;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  addAllEventListeners() {
    this.mouseDown = false;

    window.addEventListener("mousemove", (e) => {
      if (this.mouseDown) {
        this.triggerRoot(e.offsetX, e.offsetY);
      }
    });

    window.addEventListener("mousedown", (e) => {
      this.mouseDown = true;
      this.triggerRoot(e.offsetX, e.offsetY);
    });

    window.addEventListener("mouseup", (e) => {
      this.mouseDown = false;
    });

    // requestAnimationFrame(this.loop.bind(this));
  }
}
