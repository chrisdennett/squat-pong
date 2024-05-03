let vidCanvas = null;
let vidCtx = null;

export function drawVideoToCanvas(video) {
  const { videoWidth, videoHeight } = video;

  if (!vidCanvas) {
    vidCanvas = document.createElement("canvas");
    vidCanvas.width = videoWidth;
    vidCanvas.height = videoHeight;
    vidCtx = vidCanvas.getContext("2d");
  }

  vidCtx.save();
  vidCtx.translate(0, videoHeight);
  vidCtx.scale(1, -1);
  //  ctx.filter = "invert(100%)";
  // ctx.globalAlpha = 0.1;
  // ctx.globalCompositeOperation = "multiply";

  vidCtx.drawImage(video, 0, 0);
  vidCtx.restore();

  return vidCanvas;
}

// fade out the blob canvas trails
// blobCtx.globalAlpha = 0.01; // fade rate
// blobCtx.globalCompositeOperation = "destination-out"; // fade out destination pixels
// blobCtx.fillRect(0, 0, blobsCanvas.width, blobsCanvas.height);
// blobCtx.globalCompositeOperation = "source-over";
// blobCtx.globalAlpha = 1; // reset alpha
