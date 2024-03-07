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
let target1Colour = { r: 210, g: 246, b: 132 }; // rgb(179,184,99)
let target2Colour = { r: 24, g: 100, b: 65 };

// Setup
canvas.width = 800;
canvas.height = 600;
colour1.style.width = "30px";
colour1.style.height = "30px";
colour1.style.backgroundColor = `rgb(${target1Colour.r},${target1Colour.g},${target1Colour.b})`;
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
const allBlobs = [];
const allBlobs2 = [];

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
    target1Colour = { r, g, b };
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
  const useGhosting = false;
  if (useGhosting) {
    blobCtx.globalAlpha = 0.1; // fade rate
    blobCtx.globalCompositeOperation = "destination-out"; // fade out destination pixels
    blobCtx.fillRect(0, 0, blobsCanvas.width, blobsCanvas.height);
    blobCtx.globalCompositeOperation = "source-over";
    blobCtx.globalAlpha = 1; // reset alpha
  } else {
    blobCtx.clearRect(0, 0, blobsCanvas.width, blobsCanvas.height);
  }

  for (let blob of allBlobs) {
    blob.clear();
  }

  for (let blob of allBlobs2) {
    blob.clear();
  }

  runForEveryPixel(smallCanvas, smallCtx, (pixelColour, x, y) => {
    // check for target1 blobs
    const pixelMatchesTarget1 = TrackingBlob.isWithinTolerance(
      pixelColour,
      target1Colour,
      params.tolerance
    );
    if (pixelMatchesTarget1) {
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
        const newBlob = new TrackingBlob("red");
        newBlob.addIfWithinRange(xPos, yPos, params.maxBlobRadius);
        allBlobs.push(newBlob);
      }
    }
    // check for target2 blobs
    else {
      const pixelMatchesTarget2 = TrackingBlob.isWithinTolerance(
        pixelColour,
        target2Colour,
        params.tolerance
      );
      if (pixelMatchesTarget2) {
        let addedToBlob = false;
        const xPos = x; // * scaleX;
        const yPos = y; // * scaleY;

        for (let blob of allBlobs2) {
          // if pixel is close to another blob add it to that blob
          addedToBlob = blob.addIfWithinRange(xPos, yPos, params.maxBlobRadius);
          if (addedToBlob) {
            break;
          }
        }

        // otherwise create a new blob
        if (!addedToBlob) {
          const newBlob = new TrackingBlob("blue");
          newBlob.addIfWithinRange(xPos, yPos, params.maxBlobRadius);
          allBlobs2.push(newBlob);
        }
      }
    }
  });

  // draw blobs to blob canvas
  for (let blob of allBlobs) {
    blob.display(blobCtx, 1);
    // blob.display(ctx, scaleX);
  }

  for (let blob of allBlobs2) {
    blob.display(blobCtx, 1);
    // blob.display(ctx, scaleX);
  }

  let breakLoop = false;
  for (let colour1Blob of allBlobs) {
    // if(blob.x + blob.width)

    for (let colour2Blob of allBlobs2) {
      if (colour2Blob.left - colour1Blob.right < 10) {
        // found a pair
        blobCtx.strokeStyle = "yellow";
        blobCtx.strokeRect(
          colour1Blob.left,
          colour1Blob.top,
          colour1Blob.width + colour2Blob.width,
          Math.max(colour1Blob.height, colour2Blob.height)
        );

        break;
      }
    }

    if (breakLoop) break;
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
