export class PlayerTracker {
  constructor() {
    this.landmarks = [];
    this.minY = 100;
    this.maxY = 300;
    this.isDetected = false;
    this.noseY = -30;
  }

  setMinY() {
    this.minY = this.getNoseY();
  }

  setMaxY() {
    this.maxY = this.getNoseY();
  }

  get bothHandsAreUp() {
    const noseY = this.getNoseY();
    const leftHandY = this.leftHand.y;
    const rightHandY = this.rightHand.y;

    // gap between shoulders and nose.
    const threshold = 0.12;

    const lefHandUp = noseY - leftHandY > threshold;
    const rightHandUp = noseY - rightHandY > threshold;

    return lefHandUp && rightHandUp;
  }

  setLandmarks(landmarks) {
    this.isDetected = landmarks.length > 0;
    this.landmarks = landmarks;
  }

  drawMinMax(ctx, w) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, w, this.minY);
    ctx.fillRect(0, this.maxY, w, 200);

    // min max markers
    ctx.fillStyle = "yellow";
    ctx.fillRect(0, this.minY - 3, w, 6);
    ctx.fillRect(0, this.maxY - 3, w, 6);

    // nose marker
    ctx.fillRect(0, this.noseY - 5, w, 10);
  }

  get y() {
    const noseY = this.getNoseY();

    const range = this.maxY - this.minY;
    const yPos = noseY - this.minY;

    return yPos / range;
  }

  // 9 left wrist
  get leftHand() {
    let pos = { x: 0, y: 0, z: 0 };
    if (this.landmarks && this.landmarks.length >= 9) {
      pos = this.landmarks[9];
    }

    return { ...pos };
  }

  // 10 right wrist
  get rightHand() {
    let pos = { x: 0, y: 0, z: 0 };
    if (this.landmarks && this.landmarks.length >= 10) {
      pos = this.landmarks[10];
    }

    return { y: pos.y, visibility: pos.visibility };
  }

  getNoseY() {
    let pos = { x: 0, y: 0, z: 0 };
    if (this.landmarks && this.landmarks.length > 0) {
      pos = this.landmarks[0];
    }

    this.noseY = pos.y;

    return pos.y;
  }
}
