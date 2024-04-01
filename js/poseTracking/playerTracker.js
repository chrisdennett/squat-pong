export class PlayerTracker {
  constructor() {
    this.landmarks = [];
    this.y = 0;
    this.minY = 0.2;
    this.maxY = 0.8;
  }

  setMinY() {
    this.minY = this.y;
  }

  setMaxY() {
    this.maxY = this.y;
  }

  setLandmarks(landmarks) {
    this.landmarks = landmarks;
    this.y = this.getNosePos();
  }

  getNosePos() {
    let pos = { x: 0, y: 0, z: 0 };
    if (this.landmarks && this.landmarks.length > 0) {
      pos = this.landmarks[0];
    }

    return pos.y;
  }
}
