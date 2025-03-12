export class StickFigureRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.lineWidth = 10;
  }

  clear() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawStickFigureWithTrail(pose, color = "white") {
    if (!pose || !pose.landmarks) return;

    // Number of copies to draw
    const numCopies = 5;
    // How much to scale down each copy
    const scaleStep = 0.15;
    // How much to offset each copy (creates depth effect)
    const offsetStep = 20;

    // Draw multiple copies of the stick figure, starting from smallest/farthest
    for (let copy = numCopies - 1; copy >= 0; copy--) {
      // Calculate scale and opacity for this copy
      const scale = 1 - copy * scaleStep;
      const opacity = 0.3 + 0.7 * (1 - copy / numCopies);

      // Create a color with opacity
      const trailColor =
        color === "white"
          ? `rgba(255, 255, 255, ${opacity})`
          : `rgba(255, 255, 0, ${opacity})`;

      // Create a modified pose with scaled and offset landmarks
      const modifiedPose = this.createScaledPose(
        pose,
        scale,
        copy * offsetStep
      );

      // Draw the stick figure with modified parameters
      this.drawStickFigure(modifiedPose, trailColor, scale);
    }
  }

  createScaledPose(pose, scale, offset) {
    const { landmarks, box } = pose;

    // Calculate center point of the pose to use as reference for scaling
    let centerX = 0,
      centerY = 0,
      pointCount = 0;
    landmarks.forEach((point) => {
      if (point && point.x && point.y) {
        centerX += point.x;
        centerY += point.y;
        pointCount++;
      }
    });

    if (pointCount === 0) return pose;

    centerX /= pointCount;
    centerY /= pointCount;

    // Create scaled and offset versions of each keypoint
    const scaledLandmarks = landmarks.map((point) => {
      if (!point || point.x === undefined || point.y === undefined) {
        return point;
      }
      return {
        ...point,
        x: centerX + (point.x - centerX) * scale + offset,
        y: centerY + (point.y - centerY) * scale + offset / 2,
      };
    });

    // Create a new scaled box if it exists
    let scaledBox = null;
    if (box && box.width) {
      const boxCenterX = box.xMin + box.width / 2;
      const boxCenterY = box.yMin + box.height / 2;

      scaledBox = {
        ...box,
        width: box.width * scale,
        height: box.height * scale,
        xMin: boxCenterX + (box.xMin - boxCenterX) * scale + offset,
        yMin: boxCenterY + (box.yMin - boxCenterY) * scale + offset / 2,
        xMax: boxCenterX + (box.xMax - boxCenterX) * scale + offset,
        yMax: boxCenterY + (box.yMax - boxCenterY) * scale + offset / 2,
      };
    }

    return {
      landmarks: scaledLandmarks,
      box: scaledBox,
    };
  }

  drawStickFigure(pose, color = "white", scale = 1) {
    if (!pose || !pose.landmarks) return;

    const { landmarks, box } = pose;
    // Scale factors to map from video coordinates to canvas dimensions
    // Assuming landmarks are in the range of 0-640 for x and 0-480 for y (typical webcam resolution)
    this.scaleX = this.canvas.width / 640;
    this.scaleY = this.canvas.height / 480;

    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = this.lineWidth * scale;

    // this.drawNormalisedBox(box);

    for (let i = 0; i < landmarks.length; i++) {
      this.drawCircle(landmarks[i], scale);
    }

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

  drawCircle(pt, scale = 1) {
    if (!pt || pt.x === undefined || pt.y === undefined) return;
    const x = pt.x * this.scaleX;
    const y = pt.y * this.scaleY;

    this.ctx.beginPath();
    this.ctx.arc(x, y, 15 * scale, 0, 2 * Math.PI);
    this.ctx.fill();
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
