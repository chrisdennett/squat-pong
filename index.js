import { TrackingBlob } from "./js/TrackingBlob.js";
import { connectWebcam } from "./js/connectWebcam.js";
import { initControls } from "./js/controls.js";
import { drawVideoToCanvas } from "./js/drawVideoToCanvas.js";

const webcamVideo = document.querySelector("#webcamVideo");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Settings
const webcamSize = { w: 320, h: 240 };
let targetColour = { r: 255, g: 0, b: 0 };
const maxBlobRadius = 100;

// Setup
canvas.width = 800;
canvas.height = 600;

const smallCanvas = document.querySelector("#smallCanvas");
smallCanvas.width = 320;
smallCanvas.height = 240;
const smallCtx = smallCanvas.getContext("2d", { willReadFrequently: true });
smallCtx.willReadFrequently = true;

const scaleX = canvas.width / smallCanvas.width;
// const scaleY = canvas.height / smallCanvas.height;
const blob = new TrackingBlob(targetColour);

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

  blob.clear();

  const imgData = smallCtx.getImageData(
    0,
    0,
    smallCanvas.width,
    smallCanvas.height
  );
  const data = imgData.data;

  // for every row
  for (let y = 0; y < smallCanvas.height; y++) {
    // for every pixel in the row
    for (let x = 0; x < smallCanvas.width; x++) {
      // Calculate the index of the current pixel in the image data array
      const i = (y * smallCanvas.width + x) * 4;

      // Access the RGBA values of the pixel
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const testColour = { r, g, b };

      if (
        TrackingBlob.isWithinTolerance(
          testColour,
          targetColour,
          params.tolerance
        )
      ) {
        blob.addIfWithinRange(x * scaleX, y * scaleX, maxBlobRadius);
      }
    }
  }

  blob.display(ctx, scaleX);

  window.requestAnimationFrame(loop);
}

function drawBlob(blob) {
  ctx.fillStyle = "red";
  const x = blob.x1 * scaleX;
  const y = blob.y1 * scaleX;
  const w = (blob.x2 - blob.x1) * scaleX;
  const h = (blob.y2 - blob.y1) * scaleX;

  if (w > 0) {
    ctx.fillRect(x, y, w, h);
  }
}

// const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
// const data = imgData.data;

// let marker = { x: 0, y: 0 };

// // for every row
// for (let y = 0; y < webcamSize.h; y++) {
//   let colour1Count = 0;
//   let colour2Count = 0;
//   let colour1Found;
//   let colour2Found;
//   let markerFound = false;

//   // for every pixel in the row
//   for (let x = 0; x < webcamSize.w; x++) {
//     // Calculate the index of the current pixel in the image data array
//     const i = (y * webcamSize.w + x) * 4;

//     // Access the RGBA values of the pixel
//     const webcamColour = { r: data[i], g: data[i + 1], b: data[i + 2] };

//     colour1Found = testColour(webcamColour, targetColour, tolerance);

//     if (colour1Found) {
//       colour1Count++;
//     }

//     if (colour1Count >= colourCountTarg) {
//       colour2Found = testColour(webcamColour, targetColour2, tolerance);

//       if (colour2Found) {
//         colour2Count++;
//       }

//       if (colour2Count >= colourCountTarg) {
//         marker.x = x;
//         marker.y = y;
//         markerFound = true;
//         // console.log("markerFound: ", markerFound);
//       }
//     }
//   }
// }

//   ctx.putImageData(imgData, 0, 0);

// ctx.fillStyle = "red";
// ctx.fillRect(marker.x, marker.y, 30, 100);

// for every row
// for (let y = 0; y < smallCanvas.height; y++) {
//   // for every pixel in the row
//   for (let x = 0; x < smallCanvas.width; x++) {
//     // Calculate the index of the current pixel in the image data array
//     const i = (y * smallCanvas.width + x) * 4;

//     // Access the RGBA values of the pixel
//     const r = data[i];
//     const g = data[i + 1];
//     const b = data[i + 2];
//     const testColour = { r, g, b };

//     if (isWithinTolerance(testColour, targetColour, tolerance)) {
//       const colourTotal = r + b + g;
//       const distanceFromTarget = Math.abs(tragetColourTotal - colourTotal);
//       if (distanceFromTarget < closestMatch) {
//         closestMatch = distanceFromTarget;
//         console.log("closestMatch: ", closestMatch);
//         marker = { x, y };
//       }
//     }

//     // tragetColourTotal
//   }
// }
