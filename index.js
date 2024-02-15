import { connectWebcam } from "./js/connectWebcam.js";

const webcamVideo = document.querySelector("#webcamVideo");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Settings
const webcamSize = { w: 320, h: 240 };
let targetColour1 = { r: 255, g: 0, b: 0 }; // pink
let tragetColourTotal = targetColour1.r + targetColour1.g + targetColour1.b;

const tolerance = 30; // threshold
const colourCountTarg = 5;
ctx.fillStyle = "red";

// Setup
canvas.width = 800;
canvas.height = 600;

const smallCanvas = document.querySelector("#smallCanvas");
smallCanvas.width = canvas.width;
smallCanvas.height = canvas.height;
const smallCtx = smallCanvas.getContext("2d");
smallCtx.willReadFrequently = true;

const scaleX = canvas.width / smallCanvas.width;
const scaleY = canvas.height / smallCanvas.height;

console.log("scaleX: ", scaleX);

// kick things off
connectWebcam(webcamVideo, webcamSize.w, webcamSize.h);
loop();

canvas.addEventListener("click", (e) => {
  const imageData = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
  const r = imageData[0];
  const g = imageData[1];
  const b = imageData[2];

  const rgbaColor = "rgb(" + r + "," + g + "," + b + ")";
  console.log("rgbaColor: ", rgbaColor);

  targetColour1 = { r, g, b }; // pink
  tragetColourTotal = r + g + b;
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

  const imgData = smallCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  let marker = { x: 0, y: 0 };

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

      if (
        r === targetColour1.r &&
        g === targetColour1.g &&
        b === targetColour1.b
      ) {
        marker = { x, y };
      }
    }
  }

  ctx.fillStyle = "red";
  ctx.fillRect(marker.x * scaleX, marker.y * scaleY, 30, 30);

  window.requestAnimationFrame(loop);
}

function drawRect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "pink";
  ctx.fillRect(rectX, rectY, rectWidth, rectHeight);
}

function drawVideoToCanvas(video, canvas) {
  const { videoWidth, videoHeight } = video;
  const ctx = canvas.getContext("2d");
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

//     colour1Found = testColour(webcamColour, targetColour1, tolerance);

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

//     if (isWithinTolerance(testColour, targetColour1, tolerance)) {
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
