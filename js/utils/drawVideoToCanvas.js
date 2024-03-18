export function drawVideoToCanvas(video, canvas) {
  const { videoWidth, videoHeight } = video;
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  //  ctx.filter = "invert(100%)";
  // ctx.globalAlpha = 0.1;
  // ctx.globalCompositeOperation = "multiply";

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

// fade out the blob canvas trails
// blobCtx.globalAlpha = 0.01; // fade rate
// blobCtx.globalCompositeOperation = "destination-out"; // fade out destination pixels
// blobCtx.fillRect(0, 0, blobsCanvas.width, blobsCanvas.height);
// blobCtx.globalCompositeOperation = "source-over";
// blobCtx.globalAlpha = 1; // reset alpha
