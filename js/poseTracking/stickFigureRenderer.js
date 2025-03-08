export class StickFigureRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
  }

  clear() {
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawStickFigure(landmarks, color = "white") {
    if (!landmarks || landmarks.length < 17) return;

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 4;

    // Draw head (circle around nose)
    const nose = landmarks[0];
    // this.ctx.strokeRect(nose.x, nose.y, 100, 100);
    if (nose) {
      const x = nose.x;
      const y = nose.y;

      this.ctx.beginPath();
      this.ctx.arc(x, y, 15, 0, 2 * Math.PI);
      this.ctx.stroke();
    }

    // Modify drawLine to handle normalization
    const drawLine = (pointA, pointB) => {
      if (pointA && pointB) {
        const x1 = pointA.x;
        const y1 = pointA.y;
        const x2 = pointB.x;
        const y2 = pointB.y;

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
    };

    // Draw body (from shoulders to hips)
    drawLine(landmarks[5], landmarks[6]); // Left to right shoulder
    drawLine(landmarks[5], landmarks[11]); // Left shoulder to left hip
    drawLine(landmarks[6], landmarks[12]); // Right shoulder to right hip
    drawLine(landmarks[11], landmarks[12]); // Left hip to right hip

    // Draw arms
    drawLine(landmarks[5], landmarks[7]); // Left shoulder to left elbow
    drawLine(landmarks[7], landmarks[9]); // Left elbow to left wrist
    drawLine(landmarks[6], landmarks[8]); // Right shoulder to right elbow
    drawLine(landmarks[8], landmarks[10]); // Right elbow to right wrist

    // Draw legs
    drawLine(landmarks[11], landmarks[13]); // Left hip to left knee
    drawLine(landmarks[13], landmarks[15]); // Left knee to left ankle
    drawLine(landmarks[12], landmarks[14]); // Right hip to right knee
    drawLine(landmarks[14], landmarks[16]); // Right knee to right ankle
  }
}
