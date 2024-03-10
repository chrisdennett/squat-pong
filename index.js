import { BlobTracker } from "./js/BlobTracker.js";
import { GlobalSettingsPanel } from "./js/GlobalSettingsPanel.js";
import { PlayerMarker } from "./js/PlayerMarker.js";
import { Blob } from "./js/Blob.js";
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

const playerOneMarker = new PlayerMarker();

// Settings controls
const globalSettings = new GlobalSettingsPanel(controls, "global");
const blob1Tracker = new BlobTracker(controls, "blob1");
const blob2Tracker = new BlobTracker(controls, "blob2");
const blob3Tracker = new BlobTracker(controls, "blob3");

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

  blob1Tracker.clearBlobs();
  blob2Tracker.clearBlobs();
  blob3Tracker.clearBlobs();

  const allBlobTrackers = [blob1Tracker, blob2Tracker, blob3Tracker];

  runForEveryPixel(smallCanvas, smallCtx, (pixelColour, x, y) => {
    for (let tracker of allBlobTrackers) {
      const pixelMatchesTarget = Blob.isWithinTolerance(
        pixelColour,
        tracker.targetColour,
        tracker.tolerance
      );

      if (pixelMatchesTarget) {
        let addedToBlob = false;
        const xPos = x; // * scaleX;
        const yPos = y; // * scaleY;

        for (let blob of tracker.blobs) {
          // if pixel is close to another blob add it to that blob
          addedToBlob = blob.addIfWithinRange(
            xPos,
            yPos,
            tracker.maxBlobRadius
          );
          if (addedToBlob) {
            break;
          }
        }

        // otherwise create a new blob
        if (!addedToBlob) {
          const newBlob = new Blob("red");
          newBlob.addIfWithinRange(xPos, yPos, tracker.maxBlobRadius);
          tracker.blobs.push(newBlob);
        }
      }
    }
  });

  const minWidth = 10;
  const minHeight = 20;

  for (let tracker of allBlobTrackers) {
    tracker.setFilteredBlobArray(minWidth, minHeight);

    // draw blobs to blob canvas
    tracker.displayBlobs(blobCtx, "green");
  }

  // MOVE THIS TO playerOneMarker
  let breakLoop = false;
  const maxGap = globalSettings.blobPairGap;

  for (let b1 of blob1Tracker.filteredBlobs) {
    for (let b2 of blob2Tracker.filteredBlobs) {
      let gapX = b2.left - b1.right;
      let gapY = Math.abs(b2.top - b1.top);

      if (b1.left < b2.left && gapX <= maxGap && gapY < maxGap) {
        // found a pair, look for the third one.

        for (let b3 of blob3Tracker.filteredBlobs) {
          gapX = b3.left - b3.right;
          gapY = Math.abs(b3.top - b2.top);

          if (b2.left < b3.left && gapX <= maxGap && gapY < maxGap) {
            playerOneMarker.update(b1, b3, blobsCanvas.height);
            playerOneMarker.display(blobCtx);
            breakLoop = true;
            break;
          }
        }

        if (breakLoop) break;
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
