import { BlobTracker } from "./BlobTracker.js";
import { GlobalSettingsPanel } from "./GlobalSettingsPanel.js";
import { PlayerMarker } from "./PlayerMarker.js";
import { Blob } from "./Blob.js";
import { rgbObjToHSL } from "./colourUtils.js";
import { connectWebcam } from "./connectWebcam.js";
import { drawVideoToCanvas } from "./drawVideoToCanvas.js";

export class WebcamPlayerTracker {
  constructor() {
    const webcamVideo = document.querySelector("#webcamVideo");

    const controls = document.querySelector("#controls");
    const blobsCanvas = document.querySelector("#blobsCanvas");
    this.smallCanvas = document.querySelector("#smallCanvas");

    // Settings
    const webcamSize = { w: 320, h: 240 };

    // Setup
    this.smallCanvas.width = blobsCanvas.width = 320;
    this.smallCanvas.height = blobsCanvas.height = 240;

    this.smallCtx = this.smallCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    this.blobCtx = blobsCanvas.getContext("2d");
    this.blobCtx.fillStyle = "rgb(255, 255, 255)";
    this.blobCtx.fillRect(0, 0, blobsCanvas.width, blobsCanvas.height);

    this.playerOneMarker = new PlayerMarker();

    // Settings controls
    this.globalSettings = new GlobalSettingsPanel(controls, "global");
    this.blob1Tracker = new BlobTracker(controls, "blob1");
    this.blob2Tracker = new BlobTracker(controls, "blob2");
    this.blob3Tracker = new BlobTracker(controls, "blob3");

    connectWebcam(webcamVideo, webcamSize.w, webcamSize.h);
  }

  update() {
    // draw webcam to small canvas to reduce pixel count
    drawVideoToCanvas(webcamVideo, this.smallCanvas);

    // draw small canvas to display canvas
    this.blobCtx.drawImage(this.smallCanvas, 0, 0);

    this.blob1Tracker.clearBlobs();
    this.blob2Tracker.clearBlobs();
    this.blob3Tracker.clearBlobs();

    const allBlobTrackers = [
      this.blob1Tracker,
      this.blob2Tracker,
      this.blob3Tracker,
    ];

    this.runForEveryPixel(
      this.smallCanvas,
      this.smallCtx,
      (pixelColour, x, y) => {
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
      }
    );

    const minWidth = 10;
    const minHeight = 20;

    for (let tracker of allBlobTrackers) {
      tracker.setFilteredBlobArray(minWidth, minHeight);

      // draw blobs to blob canvas
      tracker.displayBlobs(this.blobCtx, "green");
    }

    // MOVE THIS TO playerOneMarker
    let breakLoop = false;
    const maxGap = this.globalSettings.blobPairGap;

    for (let b1 of this.blob1Tracker.filteredBlobs) {
      for (let b2 of this.blob2Tracker.filteredBlobs) {
        let gapX = b2.left - b1.right;
        let gapY = Math.abs(b2.top - b1.top);

        if (b1.left < b2.left && gapX <= maxGap && gapY < maxGap) {
          // found a pair, look for the third one.

          for (let b3 of this.blob3Tracker.filteredBlobs) {
            gapX = b3.left - b3.right;
            gapY = Math.abs(b3.top - b2.top);

            if (b2.left < b3.left && gapX <= maxGap && gapY < maxGap) {
              this.playerOneMarker.update(b1, b3, blobsCanvas);
              this.playerOneMarker.display(this.blobCtx);
              breakLoop = true;
              break;
            }
          }

          if (breakLoop) break;
        }
      }

      if (breakLoop) break;
    }
  }

  get normalisedPlayerPositions() {
    const p1 = {
      x: this.playerOneMarker.x,
      y: this.playerOneMarker.y,
    };
    return { p1 };
  }

  runForEveryPixel(canvas, ctx, callback) {
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
}
