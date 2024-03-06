import { TrackingBlob } from "./js/TrackingBlob.js";
import { connectWebcam } from "./js/connectWebcam.js";
import { initControls } from "./js/controls.js";
import { drawVideoToCanvas } from "./js/drawVideoToCanvas.js";

const webcamVideo = document.querySelector("#webcamVideo");
const colour1 = document.querySelector("#colour1");
const colour2 = document.querySelector("#colour2");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Settings
const webcamSize = { w: 320, h: 240 };
let targetColour = { r: 234, g: 255, b: 120 }; // rgb(179,184,99)
let target2Colour = { r: 255, g: 229, b: 138 };

// Setup
canvas.width = 800;
canvas.height = 600;
colour1.style.width = "30px";
colour1.style.height = "30px";
colour1.style.backgroundColor = `rgb(${targetColour.r},${targetColour.g},${targetColour.b})`;
colour2.style.width = "30px";
colour2.style.height = "30px";
colour2.style.backgroundColor = `rgb(${target2Colour.r},${target2Colour.g},${target2Colour.b})`;

const blobsCanvas = document.querySelector("#blobsCanvas");
const smallCanvas = document.querySelector("#smallCanvas");
smallCanvas.width = blobsCanvas.width = 320;
smallCanvas.height = blobsCanvas.height = 240;
const smallCtx = smallCanvas.getContext("2d", { willReadFrequently: true });
const blobCtx = blobsCanvas.getContext("2d");
blobCtx.fillStyle = "rgb(255, 255, 255)";
blobCtx.fillRect(0, 0, blobsCanvas.width, blobsCanvas.height);

// const scaleX = canvas.width / smallCanvas.width;
// const scaleY = canvas.height / smallCanvas.height;
const blob = new TrackingBlob();
const allBlobs = [blob];

// kick things off
const controls = document.querySelector("#controls");
const params = initControls(controls);
connectWebcam(webcamVideo, webcamSize.w, webcamSize.h);
loop();

// select colour
smallCanvas.addEventListener("click", (e) => {
  const imageData = smallCtx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
  const r = imageData[0];
  const g = imageData[1];
  const b = imageData[2];
  const rgbaColor = "rgb(" + r + "," + g + "," + b + ")";
  console.log("rgbaColor: ", rgbaColor);
  if (e.shiftKey) {
    target2Colour = { r, g, b };
    colour2.style.backgroundColor = `rgb(${r},${g},${b})`;
  } else {
    targetColour = { r, g, b };
    colour1.style.backgroundColor = `rgb(${r},${g},${b})`;
  }
});

// Loop
function loop() {
  // draw webcam to small canvas to reduce pixel count
  drawVideoToCanvas(webcamVideo, smallCanvas);

  // draw small canvas to display canvas
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

  // draw blob canvas to display canvas
  ctx.drawImage(
    blobsCanvas,
    0,
    0,
    blobsCanvas.width,
    blobsCanvas.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // fade out the blob canvas trails
  blobCtx.globalAlpha = 0.1; // fade rate
  blobCtx.globalCompositeOperation = "destination-out"; // fade out destination pixels
  blobCtx.fillRect(0, 0, blobsCanvas.width, blobsCanvas.height);
  blobCtx.globalCompositeOperation = "source-over";
  blobCtx.globalAlpha = 1; // reset alpha

  for (let blob of allBlobs) {
    blob.clear();
  }

  runForEveryPixel(smallCanvas, smallCtx, (pixelColour, x, y) => {
    const pixelMatchesTarget = TrackingBlob.isWithinTolerance(
      pixelColour,
      targetColour,
      params.tolerance
    );

    if (pixelMatchesTarget) {
      let addedToBlob = false;
      const xPos = x; // * scaleX;
      const yPos = y; // * scaleY;

      for (let blob of allBlobs) {
        // if pixel is close to another blob add it to that blob
        addedToBlob = blob.addIfWithinRange(xPos, yPos, params.maxBlobRadius);
        if (addedToBlob) {
          break;
        }
      }

      // otherwise create a new blob
      if (!addedToBlob) {
        const newBlob = new TrackingBlob();
        newBlob.addIfWithinRange(xPos, yPos, params.maxBlobRadius);
        allBlobs.push(newBlob);
      }
    }
  });

  // draw blobs to blob canvas
  for (let blob of allBlobs) {
    blob.display(blobCtx, 1);
    // blob.display(ctx, scaleX);
  }

  // keep the loop running
  window.requestAnimationFrame(loop);
}

function runForEveryPixel(canvas, ctx, callback) {
  ctx.willReadFrequently = true;
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
