import { TrackingBlob } from "./js/TrackingBlob.js";
import { connectWebcam } from "./js/connectWebcam.js";
import { initControls } from "./js/controls.js";
import { drawVideoToCanvas } from "./js/drawVideoToCanvas.js";

const webcamVideo = document.querySelector("#webcamVideo");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Settings
const webcamSize = { w: 320, h: 240 };
let targetColour = { r: 179, g: 184, b: 99 }; // rgb(179,184,99)

// Setup
canvas.width = 800;
canvas.height = 600;

const smallCanvas = document.querySelector("#smallCanvas");
smallCanvas.width = 320;
smallCanvas.height = 240;

const scaleX = canvas.width / smallCanvas.width;
// const scaleY = canvas.height / smallCanvas.height;
const blob = new TrackingBlob();
const allBlobs = [blob];

// kick things off
const controls = document.querySelector("#controls");
const params = initControls(controls);
connectWebcam(webcamVideo, webcamSize.w, webcamSize.h);
loop();

canvas.addEventListener("click", (e) => {
  const imageData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
  const r = imageData[0];
  const g = imageData[1];
  const b = imageData[2];
  const rgbaColor = "rgb(" + r + "," + g + "," + b + ")";
  console.log("rgbaColor: ", rgbaColor);
  targetColour = { r, g, b };
});

// Loop
function loop() {
  // draw webcam to small canvas to reduce pixel count
  drawVideoToCanvas(webcamVideo, smallCanvas);

  ctx.drawImage(
    smallCanvas,
    0,
    0,
    smallCanvas.width,
    smallCanvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  for (let blob of allBlobs) {
    blob.clear();
  }

  runForEveryPixel(smallCanvas, (testColour, x, y) => {
    if (
      TrackingBlob.isWithinTolerance(testColour, targetColour, params.tolerance)
    ) {
      let addedToBlob = false;
      const xPos = x * scaleX;
      const yPos = y * scaleX;

      for (let blob of allBlobs) {
        addedToBlob = blob.addIfWithinRange(xPos, yPos, params.maxBlobRadius);

        if (addedToBlob) {
          break;
        }
      }

      if (!addedToBlob) {
        const newBlob = new TrackingBlob();
        newBlob.addIfWithinRange(xPos, yPos, params.maxBlobRadius);
        allBlobs.push(newBlob);
      }
    }
  });

  for (let blob of allBlobs) {
    blob.display(ctx, scaleX);
  }

  window.requestAnimationFrame(loop);
}

function runForEveryPixel(canvas, callback) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // for every row
  for (let y = 0; y < canvas.height; y++) {
    // for every pixel in the row
    for (let x = 0; x < canvas.width; x++) {
      // Calculate the index of the current pixel in the image data array
      const i = (y * canvas.width + x) * 4;

      // Access the RGBA values of the pixel
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      callback({ r, g, b }, x, y);
    }
  }
}
