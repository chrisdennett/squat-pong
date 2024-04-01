export class PlayerTracker {
  constructor() {
    this.landmarks = [];
    this.y = 0;
    this.minY = 0;
    this.maxY = 100;
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
