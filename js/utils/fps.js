const fpsCounter = document.getElementById('fpsCounter');

let fps = 0;
let avFps = 0;
const avCount = 50;
const valuesToAverage = [];
let lastFrameTime = performance.now();

export function calculateFPS() {
    const currentFrameTime = performance.now();
    const deltaTime = currentFrameTime - lastFrameTime;
    lastFrameTime = currentFrameTime;
  
    // Calculate FPS
    fps = Math.round(1000 / deltaTime);
    valuesToAverage.push(fps);

    if(valuesToAverage.length >= avCount){
        valuesToAverage.shift();
    }

    const total = valuesToAverage.reduce((tally, curr) => tally + curr);
    avFps = Math.round(total / valuesToAverage.length);
  
    // Display FPS
    fpsCounter.innerHTML = `av FPS: ${avFps}`;
  }