export class PlayerTracker {
  constructor() {
    this.landmarks = [];
    this.minY = 0.2;
    this.maxY = 0.8;
  }

  setMinY() {
    this.minY = this.getNoseY();
  }

  setMaxY() {
    this.maxY = this.getNoseY();
  }

  setLandmarks(landmarks) {
    this.landmarks = landmarks;
  }

  get y() {
    const noseY = this.getNoseY();
    const range = this.maxY - this.minY;
    const yPos = noseY - this.minY;

    return yPos / range;
  }

  getNoseY() {
    let pos = { x: 0, y: 0, z: 0 };
    if (this.landmarks && this.landmarks.length > 0) {
      pos = this.landmarks[0];
    }

    return pos.y;
  }
}
