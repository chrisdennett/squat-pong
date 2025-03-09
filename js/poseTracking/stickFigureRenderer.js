export class StickFigureRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.lineWidth = 10;
  }

  clear() {
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawStickFigure(pose, color = "white") {
    if (!pose || !pose.landmarks) return;

    const { landmarks, box } = pose;

    // Scale factors to map from video coordinates to canvas dimensions
    // Assuming landmarks are in the range of 0-640 for x and 0-480 for y (typical webcam resolution)
    this.scaleX = this.canvas.width / 640;
    this.scaleY = this.canvas.height / 480;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = this.lineWidth;

    this.drawNormalisedBox(box);

    for (let i = 0; i < landmarks.length; i++) {
      this.drawCircle(landmarks[i]);
    }

    // const nose = landmarks[0];
    // const leftEye = landmarks[1];
    // const rightEye = landmarks[2];
    // const leftEar = landmarks[3];
    // const rightEar = landmarks[4];
    // this.drawCircle(nose);
    // this.drawCircle(leftEye);
    // this.drawCircle(rightEye);
    // this.drawCircle(leftEar);
    // this.drawCircle(rightEar);

    // Draw body (from shoulders to hips)
    this.drawLine(landmarks[5], landmarks[6]); // Left to right shoulder
    this.drawLine(landmarks[5], landmarks[11]); // Left shoulder to left hip
    this.drawLine(landmarks[6], landmarks[12]); // Right shoulder to right hip
    this.drawLine(landmarks[11], landmarks[12]); // Left hip to right hip

    // Draw arms
    this.drawLine(landmarks[5], landmarks[7]); // Left shoulder to left elbow
    this.drawLine(landmarks[7], landmarks[9]); // Left elbow to left wrist
    this.drawLine(landmarks[6], landmarks[8]); // Right shoulder to right elbow
    this.drawLine(landmarks[8], landmarks[10]); // Right elbow to right wrist

    // Draw legs
    this.drawLine(landmarks[11], landmarks[13]); // Left hip to left knee
    this.drawLine(landmarks[13], landmarks[15]); // Left knee to left ankle
    this.drawLine(landmarks[12], landmarks[14]); // Right hip to right knee
    this.drawLine(landmarks[14], landmarks[16]); // Right knee to right ankle
  }

  drawCircle(pt) {
    const x = pt.x * this.scaleX;
    const y = pt.y * this.scaleY;

    this.ctx.beginPath();
    this.ctx.arc(x, y, 15, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  drawLine(pointA, pointB) {
    if (pointA && pointB) {
      const x1 = pointA.x * this.scaleX;
      const y1 = pointA.y * this.scaleY;
      const x2 = pointB.x * this.scaleX;
      const y2 = pointB.y * this.scaleY;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  drawNormalisedBox(box) {
    if (!box || !box.width) return;

    const { height, width, xMax, xMin, yMax, yMin } = box;

    this.ctx.strokeRect(
      xMin * this.canvas.width,
      yMin * this.canvas.height,
      width * this.canvas.width,
      height * this.canvas.height
    );
  }
}
