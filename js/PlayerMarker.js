export class PlayerMarker {
  constructor(canvas, globalSettings) {
    this.canvas = canvas;
    this.globalSettings = globalSettings;
    this.markerFound = false;
  }

  findMarker(blob1Tracker, blob2Tracker, blob3Tracker) {
    // MOVE THIS TO playerOneMarker
    this.markerFound = false;
    const maxGap = this.globalSettings.blobPairGap;

    for (let b1 of blob1Tracker.filteredBlobs) {
      for (let b2 of blob2Tracker.filteredBlobs) {
        let gapX = b2.left - b1.right;
        let gapY = Math.abs(b2.top - b1.top);

        if (b1.left < b2.left && gapX <= maxGap && gapY < maxGap) {
          // found a pair, look for the third one.

          for (let b3 of blob3Tracker.filteredBlobs) {
            gapX = b3.left - b2.right;
            gapY = Math.abs(b3.top - b2.top);

            if (b2.left < b3.left && gapX <= maxGap && gapY < maxGap) {
              this.update(b1, b3);
              this.markerFound = true;
              break;
            }
          }

          if (this.markerFound) break;
        }
      }

      if (this.markerFound) break;
    }
  }

  update(blob1, blob2) {
    this.left = Math.min(blob1.left, blob2.left);
    this.right = Math.max(blob1.right, blob2.right);
    this.top = Math.min(blob1.top, blob2.top);
    this.bottom = Math.max(blob1.bottom, blob2.bottom);
    this.width = this.right - this.left;
    this.height = this.bottom - this.top;
    const halfHeight = this.height / 2;
    this.middleY = this.top + halfHeight;

    // set normalised value for x, y so can be used on diff sized canvases
    const verticalRange = this.canvas.height - this.height;
    const horizontalRange = this.canvas.width - this.height;
    this.y = this.top / verticalRange;
    this.x = this.right / horizontalRange;
  }

  display(ctx) {
    if (this.markerFound) {
      ctx.strokeStyle = "yellow";
      ctx.fillStyle = "yellow";
      ctx.strokeRect(this.left, this.top, this.width, this.height);
      ctx.fillRect(this.left, this.middleY - 1, this.width, 2);
      ctx.strokeText("PLAYER ONE", this.left, this.top);
      ctx.fillStyle = "red";
      ctx.font = "20px Arial";
      ctx.fillText("PLAYER ONE", this.left, this.top);
    }
  }
}
