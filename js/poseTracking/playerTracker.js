export class PlayerTracker {
  constructor() {
    this.landmarks = [];
    this.minY = 0.35;
    this.maxY = 0.6;
    this.isDetected = false;
  }

  setMinY() {
    this.minY = this.getNoseY();
  }

  setMaxY() {
    this.maxY = this.getNoseY();
  }

  setLandmarks(landmarks) {
    this.isDetected = landmarks.length > 0;
    this.landmarks = landmarks;
  }

  drawLandmarks(ctx, w, h) {
    if (this.landmarks.length > 0) {
      for (let i = 0; i < this.landmarks.length; i++) {
        let colour = i === 0 ? "red" : "black";
        const m = this.landmarks[i];
        ctx.fillStyle = colour;
        ctx.fillRect(m.x * w, m.y * h, 7, 7);
      }
    }
  }

  drawMinMax(ctx, w, h, isPlayerTwo) {
    ctx.fillStyle = "yellow";
    ctx.fillRect(0, this.minY * h, w, 2);
    ctx.fillRect(0, this.maxY * h, w, 2);
  }

  get y() {
    const noseY = this.getNoseY();
    const range = this.maxY - this.minY;
    const yPos = noseY - this.minY;

    return yPos / range;
  }

  get leftHand() {
    let pos = { x: 0, y: 0, z: 0 };
    if (this.landmarks && this.landmarks.length >= 17) {
      pos = this.landmarks[17];
    }

    return { ...pos };
  }

  get rightHand() {
    let pos = { x: 0, y: 0, z: 0 };
    if (this.landmarks && this.landmarks.length >= 18) {
      pos = this.landmarks[18];
    }

    return { y: pos.y, visibility: pos.visibility };
  }

  getNoseY() {
    let pos = { x: 0, y: 0, z: 0 };
    if (this.landmarks && this.landmarks.length > 0) {
      pos = this.landmarks[0];
    }

    return pos.y;
  }
}
