import { BlobSettingsPanel } from "./js/BlobSettingsPanel.js";
import { GlobalSettingsPanel } from "./js/GlobalSettingsPanel.js";
import { PlayerMarker } from "./js/PlayerMarker.js";
import { TrackingBlob } from "./js/TrackingBlob.js";
import { rgbObjToHSL } from "./js/colourUtils.js";
import { connectWebcam } from "./js/connectWebcam.js";
import { drawVideoToCanvas } from "./js/drawVideoToCanvas.js";

const webcamVideo = document.querySelector("#webcamVideo");
const canvas = document.querySelector("#canvas");
const controlPanel = document.querySelector("#controlPanel");
const controls = document.querySelector("#controls");
const info = document.querySelector("#info");
const blobsCanvas = document.querySelector("#blobsCanvas");
const smallCanvas = document.querySelector("#smallCanvas");

// Settings
const webcamSize = { w: 320, h: 240 };

// const testColour = { r: 0, g: 55, b: 55 };
// const hslOut = rgbObjToHSL(testColour);
// console.log("hslOut: ", hslOut);

// Setup
canvas.width = 800;
canvas.height = 600;
smallCanvas.width = blobsCanvas.width = 320;
smallCanvas.height = blobsCanvas.height = 240;

const ctx = canvas.getContext("2d", { willReadFrequently: true });
const smallCtx = smallCanvas.getContext("2d", { willReadFrequently: true });
const blobCtx = blobsCanvas.getContext("2d");
blobCtx.fillStyle = "rgb(255, 255, 255)";
blobCtx.fillRect(0, 0, blobsCanvas.width, blobsCanvas.height);

const allBlobs = [];
const allBlobs2 = [];
const playerOneMarker = new PlayerMarker();

// Settings controls
const blob1Settings = new BlobSettingsPanel(controls, "blob1");
const blob2Settings = new BlobSettingsPanel(controls, "blob2");
const globalSettings = new GlobalSettingsPanel(controls, "global");

// controlPanel.style.display = "none";

document.addEventListener("keyup", (e) => {
  if (e.key === "b") {
    if (controlPanel.style.display === "none") {
      controlPanel.style.display = "inherit";
    } else {
      controlPanel.style.display = "none";
    }
  }
});

connectWebcam(webcamVideo, webcamSize.w, webcamSize.h);
loop();

// Loop
function loop() {
  // update paddle based on marker input
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const paddleH = 50;
  const range = canvas.height - paddleH;
  const paddleY = playerOneMarker.y * range;
  info.innerHTML = playerOneMarker.y;
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

      if (
        colour1Blob.left < colour2Blob.left &&
        gap <= globalSettings.blobPairGap
      ) {
        // found a pair
        playerOneMarker.update(colour1Blob, colour2Blob, blobsCanvas.height);
        playerOneMarker.display(blobCtx);

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

      const hsl = rgbObjToHSL({ r, g, b });

      callback(hsl, x, y);
    }
  }
}
