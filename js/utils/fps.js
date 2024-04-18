const fpsCounter = document.getElementById("fpsCounter");

let secondsPassed;
let oldTimeStamp;
let fps;

export function calculateFPS(timeStamp) {
  // Calculate the number of seconds passed since the last frame
  secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  // Calculate fps
  fps = Math.round(1 / secondsPassed);

  // Display FPS
  fpsCounter.innerHTML = `FPS: ${fps}`;
}
