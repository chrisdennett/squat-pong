/*
 * Find the three blobs that make up a Player Marker.
 */

export class PlayerMarker {
  constructor(canvas, globalSettings, label) {
    this.canvas = canvas;
    this.globalSettings = globalSettings;
    this.label = label;
  }

  static findMarkerBounds(
    blob1Tracker,
    blob2Tracker,
    blob3Tracker,
    globalSettings
  ) {
    const maxGap = globalSettings.blobPairGap;
    const markerBounds = { left: 0, right: 0, top: 0, bottom: 0 };

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
              // If Meet all these criteria we've found our marker!
              markerBounds.left = b1.left; //Math.min(b1.left, b2.left);
              markerBounds.right = b3.right; //Math.max(b1.right, b2.right);
              markerBounds.top = Math.min(b1.top, b2.top, b3.top);
              markerBounds.bottom = Math.max(b1.bottom, b2.bottom, b2.bottom);

              // this.update(b1, b3);
              return markerBounds;
            }
          }
        }
      }
    }

    return null;
  }

  update(bounds) {
    this.left = bounds.left;
    this.right = bounds.right;
    this.top = bounds.top;
    this.bottom = bounds.bottom;
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
    ctx.strokeStyle = "yellow";
    ctx.fillStyle = "yellow";
    ctx.strokeRect(this.left, this.top, this.width, this.height);
    ctx.fillRect(this.left, this.middleY - 1, this.width, 2);
    ctx.strokeText(this.label, this.left, this.top);
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.fillText(this.label, this.left, this.top);
  }
}
