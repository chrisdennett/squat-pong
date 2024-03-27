/*
 * Find the three blobs that make up a Player Marker.
 */

export class PlayerMarker {
  constructor(canvas, globalSettings, type) {
    this.canvas = canvas;
    this.globalSettings = globalSettings;
    this.label = type === "p1" ? "PLAYER ONE" : "PLAYER TWO";
    this.type = type;
    this.isFound = false;
    this.minY = 20;
    this.maxY = 100;
  }

  setCurrentYAsMin() {
    this.minY = this.top;
  }

  setCurrentYAsMax() {
    this.maxY = this.bottom;
  }

  update(blob1Tracker, blob2Tracker, blob3Tracker, globalSettings) {
    const maxGap = globalSettings.blobPairGap;
    const targArr = `${this.type}Blobs`;

    for (let b1 of blob1Tracker[targArr]) {
      for (let b2 of blob2Tracker[targArr]) {
        let gapX = b2.left - b1.right;
        let gapY = Math.abs(b2.top - b1.top);

        if (b1.left < b2.left && gapX <= maxGap && gapY < maxGap) {
          // found a pair, look for the third one.

          for (let b3 of blob3Tracker[targArr]) {
            gapX = b3.left - b2.right;
            gapY = Math.abs(b3.top - b2.top);

            if (b2.left < b3.left && gapX <= maxGap && gapY < maxGap) {
              // If Meet all these criteria we've found our marker!
              this.setBounds(b1, b2, b3);
              this.isFound = true;
              return;
            }
          }
        }
      }
    }

    this.isFound = false;
  }

  setBounds(b1, b2, b3) {
    this.left = b1.left;
    this.right = b3.right;
    this.top = Math.min(b1.top, b2.top, b3.top); // top of marker
    this.bottom = Math.max(b1.bottom, b2.bottom, b2.bottom);

    // derived helpful values
    this.width = this.right - this.left;
    this.height = this.bottom - this.top;
    const halfHeight = this.height / 2;
    this.middleY = this.top + halfHeight;

    // set normalised value for x, y so can be used on diff sized canvases
    // use range between min and max y
    const range = this.maxY - this.minY;
    const verticalRange = range - this.height;
    const horizontalRange = this.canvas.width - this.height;

    const relativeTop = this.top - this.minY;

    this.y = relativeTop / verticalRange;
    this.x = this.right / horizontalRange;
  }

  display(ctx) {
    ctx.strokeStyle = "yellow";
    ctx.fillStyle = "yellow";
    ctx.strokeRect(this.left, this.top, this.width, this.height);
    ctx.fillRect(this.left, this.middleY - 1, this.width, 2);
    ctx.strokeText(this.label, this.left, this.top);
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.fillText(this.label, this.left, this.top);

    // ctx.beginPath();
    // ctx.moveTo(0, this.minY);
    // ctx.lineTo(100, this.minY);

    // ctx.moveTo(0, this.maxY);
    // ctx.lineTo(100, this.maxY);
    // ctx.stroke();
  }
}
