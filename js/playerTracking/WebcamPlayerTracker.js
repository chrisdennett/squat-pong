import { BlobTracker } from "./settingsPanels/BlobTracker.js";
import { GlobalSettingsPanel } from "./settingsPanels/GlobalSettingsPanel.js";
import { PlayerMarker } from "./PlayerMarker.js";
import { Blob } from "./Blob.js";
import { rgbObjToHSL } from "../utils/colourUtils.js";
import { connectWebcam } from "../utils/connectWebcam.js";
import { drawVideoToCanvas } from "../utils/drawVideoToCanvas.js";

/**
 * MAIN CLASS to produce to coordinate finding blobs and players
 * and drawing the preview canvas.
 */

export class WebcamPlayerTracker {
  constructor() {
    const webcamVideo = document.querySelector("#webcamVideo");

    const controls = document.querySelector("#controls");
    this.blobsCanvas = document.querySelector("#blobsCanvas");
    this.smallCanvas = document.querySelector("#smallCanvas");

    // Settings
    const webcamSize = { w: 320, h: 240 };

    // Setup
    this.smallCanvas.width = this.blobsCanvas.width = 320;
    this.smallCanvas.height = this.blobsCanvas.height = 240;

    // set up some helpful player zone.
    // p1 first third, p2 last third
    const canvasThird = this.blobsCanvas.width / 3;
    this.playerOneAreaBounds = { left: 0, right: canvasThird };
    this.playerTwoAreaBounds = {
      left: canvasThird * 2,
      right: canvasThird * 3,
    };

    this.smallCtx = this.smallCanvas.getContext("2d", {
      willReadFrequently: true,
    });
    this.blobCtx = this.blobsCanvas.getContext("2d");

    // Settings controls
    this.globalSettings = new GlobalSettingsPanel(controls, "global");
    this.blob1Tracker = new BlobTracker(controls, "blob1", this.globalSettings);
    this.blob2Tracker = new BlobTracker(controls, "blob2", this.globalSettings);
    this.blob3Tracker = new BlobTracker(controls, "blob3", this.globalSettings);

    this.playerOneMarker = new PlayerMarker(
      this.blobsCanvas,
      this.globalSettings,
      "p1"
    );
    this.playerTwoMarker = new PlayerMarker(
      this.blobsCanvas,
      this.globalSettings,
      "p2"
    );

    connectWebcam(webcamVideo, webcamSize.w, webcamSize.h);
  }

  get normalisedPlayerPositions() {
    const p1 = {
      x: this.playerOneMarker.x,
      y: this.playerOneMarker.y,
      markerFound: this.playerOneMarker.markerFound,
    };
    return { p1 };
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
          const isInPlayerOneArea =
            x > this.playerOneAreaBounds.left &&
            x < this.playerOneAreaBounds.right;

          const isInPlayerTwoArea =
            x > this.playerTwoAreaBounds.left &&
            x < this.playerTwoAreaBounds.right;

          if (isInPlayerOneArea || isInPlayerTwoArea) {
            const pixelMatchesTarget = Blob.isWithinTolerance(
              pixelColour,
              tracker.targetColour,
              this.globalSettings.tolerance
            );

            if (pixelMatchesTarget) {
              const type = isInPlayerOneArea ? "p1" : "p2";
              let addedToBlob = false;
              const xPos = x; // * scaleX;
              const yPos = y; // * scaleY;

              // if pixel is close to another blob add it to that blob
              for (let blob of tracker.blobs) {
                addedToBlob = blob.addIfWithinRange(
                  xPos,
                  yPos,
                  this.globalSettings.maxBlobWidth,
                  this.globalSettings.maxBlobHeight
                );
                if (addedToBlob) {
                  // just in case this blob spans the player areas????
                  // this really shouldn't be needed.
                  blob.type = type;
                  break;
                }
              }

              // otherwise create a new blob
              if (!addedToBlob) {
                const newBlob = new Blob("red", type);
                newBlob.addIfWithinRange(
                  xPos,
                  yPos,
                  this.globalSettings.maxBlobWidth
                );
                tracker.blobs.push(newBlob);
              }
            }
          }
        }
      }
    );

    // draw all blob trackers to the canvas
    for (let blobTracker of allBlobTrackers) {
      blobTracker.filterAndSeparateBlobTypes();

      // draw blobs to blob canvas
      blobTracker.displayBlobs(this.blobCtx, "green");
    }

    // if()
    this.playerOneMarker.update(
      this.blob1Tracker,
      this.blob2Tracker,
      this.blob3Tracker,
      this.globalSettings
    );
    this.playerTwoMarker.update(
      this.blob1Tracker,
      this.blob2Tracker,
      this.blob3Tracker,
      this.globalSettings
    );

    if (this.playerOneMarker.isFound) {
      this.playerOneMarker.display(this.blobCtx);
    }

    if (this.playerTwoMarker.isFound) {
      this.playerTwoMarker.display(this.blobCtx);
    }

    // Show the canvas area that isn't included in the play area
    this.blobCtx.fillStyle = "rgba(0,0,0,0.5)";
    const unwatchedCanvas = {
      left: this.playerOneAreaBounds.right,
      width: this.playerTwoAreaBounds.left - this.playerOneAreaBounds.right,
    };
    this.blobCtx.fillRect(
      unwatchedCanvas.left,
      0,
      unwatchedCanvas.width,
      this.blobsCanvas.height
    );
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