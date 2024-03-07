import { BlobSettingsPanel } from "./js/BlobSettingsPanel.js";
import { GlobalSettingsPanel } from "./js/GlobalSettingsPanel.js";
import { TrackingBlob } from "./js/TrackingBlob.js";
import { connectWebcam } from "./js/connectWebcam.js";
import { drawVideoToCanvas } from "./js/drawVideoToCanvas.js";

const webcamVideo = document.querySelector("#webcamVideo");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Settings
const webcamSize = { w: 320, h: 240 };

// Setup
canvas.width = 800;
canvas.height = 600;

const blobsCanvas = document.querySelector("#blobsCanvas");
const smallCanvas = document.querySelector("#smallCanvas");
smallCanvas.width = blobsCanvas.width = 320;
smallCanvas.height = blobsCanvas.height = 240;
const smallCtx = smallCanvas.getContext("2d", { willReadFrequently: true });
const blobCtx = blobsCanvas.getContext("2d");
blobCtx.fillStyle = "rgb(255, 255, 255)";
blobCtx.fillRect(0, 0, blobsCanvas.width, blobsCanvas.height);

// const scaleX = canvas.width / smallCanvas.width;
//const scaleY = canvas.height / smallCanvas.height;
const allBlobs = [];
const allBlobs2 = [];

// kick things off
const controls = document.querySelector("#controls");
// const params = initControls(controls);
const blob1Settings = new BlobSettingsPanel(controls, "blob1");
const blob2Settings = new BlobSettingsPanel(controls, "blob2");
const globalSettings = new GlobalSettingsPanel(controls, "global");

let markerY = 0.5;

connectWebcam(webcamVideo, webcamSize.w, webcamSize.h);
loop();

// Loop
function loop() {
  // update paddle based on marker input
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const paddleH = 100;
  const paddleY = markerY * (canvas.height - paddleH);
  ctx.fillRect(10, paddleY, 30, paddleH);

  // draw webcam to small canvas to reduce pixel count
  drawVideoToCanvas(webcamVideo, smallCanvas);

  // draw small canvas to display canvas
  blobCtx.drawImage(smallCanvas, 0, 0);

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
      blob1Settings.targetColour,
      blob1Settings.tolerance
    );
    if (pixelMatchesTarget1) {
      let addedToBlob = false;
      const xPos = x; // * scaleX;
      const yPos = y; // * scaleY;

      for (let blob of allBlobs) {
        // if pixel is close to another blob add it to that blob
        addedToBlob = blob.addIfWithinRange(
          xPos,
          yPos,
          blob1Settings.maxBlobRadius
        );
        if (addedToBlob) {
          break;
        }
      }

      // otherwise create a new blob
      if (!addedToBlob) {
        const newBlob = new TrackingBlob("red");
        newBlob.addIfWithinRange(xPos, yPos, blob1Settings.maxBlobRadius);
        allBlobs.push(newBlob);
      }
    }
    // check for target2 blobs
    else {
      const pixelMatchesTarget2 = TrackingBlob.isWithinTolerance(
        pixelColour,
        blob2Settings.targetColour,
        blob2Settings.tolerance
      );
      if (pixelMatchesTarget2) {
        let addedToBlob = false;
        const xPos = x; // * scaleX;
        const yPos = y; // * scaleY;

        for (let blob of allBlobs2) {
          // if pixel is close to another blob add it to that blob
          addedToBlob = blob.addIfWithinRange(
            xPos,
            yPos,
            blob2Settings.maxBlobRadius
          );
          if (addedToBlob) {
            break;
          }
        }

        // otherwise create a new blob
        if (!addedToBlob) {
          const newBlob = new TrackingBlob("blue");
          newBlob.addIfWithinRange(xPos, yPos, blob2Settings.maxBlobRadius);
          allBlobs2.push(newBlob);
        }
      }
    }
  });

  // draw blobs to blob canvas
  for (let blob of allBlobs) {
    blob.display(blobCtx, 1);
  }

  for (let blob of allBlobs2) {
    blob.display(blobCtx, 1);
  }

  let breakLoop = false;
  for (let colour1Blob of allBlobs) {
    for (let colour2Blob of allBlobs2) {
      const gap = colour2Blob.left - colour1Blob.right;

      if (gap <= globalSettings.blobPairGap && gap >= 0) {
        // found a pair
        blobCtx.strokeStyle = "yellow";

        const marker = {
          left: colour1Blob.left,
          top: Math.min(colour1Blob.top, colour2Blob.top),
          bottom: Math.max(colour1Blob.bottom, colour2Blob.bottom),
          width: colour2Blob.right - colour1Blob.left,
          height: Math.max(colour1Blob.height, colour2Blob.height),
        };

        blobCtx.strokeRect(
          marker.left,
          marker.top,
          marker.width,
          marker.height
        );

        const blobPairMiddleY = marker.top + marker.height / 2;
        const maxBlobY = blobsCanvas.height - marker.height;
        markerY = blobPairMiddleY / maxBlobY;

        breakLoop = true;
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
