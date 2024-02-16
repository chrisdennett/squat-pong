import { connectWebcam } from "./js/connectWebcam.js";
import { initControls } from "./js/controls.js";

const webcamVideo = document.querySelector("#webcamVideo");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

// Settings
const webcamSize = { w: 320, h: 240 };
let targetColour = { r: 255, g: 0, b: 0 }; // pink

const tolerance = 7; // threshold
// Setup
canvas.width = 800;
canvas.height = 600;

const smallCanvas = document.querySelector("#smallCanvas");
smallCanvas.width = 320;
smallCanvas.height = 240;
const smallCtx = smallCanvas.getContext("2d", { willReadFrequently: true });
smallCtx.willReadFrequently = true;

const scaleX = canvas.width / smallCanvas.width;
const scaleY = canvas.height / smallCanvas.height;

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
  // const rgbaColor = "rgb(" + r + "," + g + "," + b + ")";
  targetColour = { r, g, b };
});

// Loop
function loop() {
  drawVideoToCanvas(webcamVideo, smallCanvas);

  console.log("params.tolerance: ", params.tolerance);

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

  const imgData = smallCtx.getImageData(
    0,
    0,
    smallCanvas.width,
    smallCanvas.height
  );
  const data = imgData.data;

  // let marker = { x: 0, y: 0 };
  let blobBounds = { x1: 1000, y1: 1000, x2: 10, y2: 10 };

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

      if (isWithinTolerance(testColour, targetColour, params.tolerance)) {
        if (x < blobBounds.x1) {
          blobBounds.x1 = x;
        }
        if (x > blobBounds.x2) {
          blobBounds.x2 = x;
        }

        if (y < blobBounds.y1) {
          blobBounds.y1 = y;
        }
        if (y > blobBounds.y2) {
          blobBounds.y2 = y;
        }

        // marker = { x, y };
      }
    }
  }

  // drawRect(marker);
  drawBlob(blobBounds);

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

function drawRect(marker) {
  ctx.fillStyle = "red";
  ctx.fillRect(
    Math.round(marker.x * scaleX),
    Math.round(marker.y * scaleY),
    30,
    30
  );
}

function drawVideoToCanvas(video, canvas) {
  const { videoWidth, videoHeight } = video;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(
    video,
    0,
    0,
    videoWidth,
    videoHeight,
    0,
    0,
    canvas.width,
    canvas.height
  );
  ctx.restore();
}

function isWithinTolerance(colour1, colour2, tolerance) {
  // test red
  const minR = colour1.r - tolerance;
  const maxR = colour1.r + tolerance;
  if (colour2.r < minR || colour2.r > maxR) {
    return false;
  }

  // if red matches test green
  const minG = colour1.g - tolerance;
  const maxG = colour1.g + tolerance;
  if (colour2.g < minG || colour2.g > maxG) {
    return false;
  }

  // if green matches test blue
  const minB = colour1.b - tolerance;
  const maxB = colour1.b + tolerance;
  if (colour2.b < minB || colour2.b > maxB) {
    return false;
  }

  // all matches.  Yay!
  return true;
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
