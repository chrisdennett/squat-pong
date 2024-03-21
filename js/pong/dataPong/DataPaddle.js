export class DataPaddle {
  constructor(params) {
    this.params = params;
    this.width = params.width;
    this.speed = params.speed;
    this.height = params.height;
    this.colour = params.colour;
    this.isLeft = params.type === "left";
    this.y = this.params.bounds.bottom / 2;
    this.x = this.isLeft
      ? params.bounds.left
      : params.bounds.right - params.width;
    this.bounds = {
      top: params.bounds.top,
      bottom: params.bounds.bottom - params.height,
    };
    this.centerPt = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
    this.randomPaddleOffset = 0.5;
  }

  reset() {
    this.y = this.params.bounds.bottom / 2;
  }

  moveUp() {
    this.y -= this.speed;
    this.restrictToBounds();
    this.updateCenterPt();
  }

  moveDown() {
    this.y += this.speed;
    this.restrictToBounds();
    this.updateCenterPt();
  }

  getXDistanceToBallAsFraction(ball) {
    let distanceToBall = 0;
    if (this.isLeft) {
      distanceToBall = ball.x - this.params.bounds.left + this.width;
    } else {
      distanceToBall = this.params.bounds.right - ball.x;
    }

    distanceToBall -= this.width;
    const maxDistance = this.params.bounds.right - this.params.bounds.left;

    return 1 - distanceToBall / maxDistance;
  }

  updateCenterPt() {
    this.centerPt.y = this.y + this.height / 2;
  }

  followBall(ball) {
    // amount of movement based on how near ball is to hitting paddle / scoring
    const xDistToBall = this.getXDistanceToBallAsFraction(ball);

    // -0.1 stops ball missing bottom of paddle if offset is 1.0
    const hitHeight = this.height + ball.size - 0.1;
    const hitY = this.y - ball.size;
    const targetPaddleY = hitY + hitHeight * this.randomPaddleOffset;
    const yDistToBall = ball.y - targetPaddleY;

    // don't move by speed unless it would take it beyond target
    const yMovementSize = yDistToBall < this.speed ? yDistToBall : this.speed;

    this.y += yMovementSize * xDistToBall;

    this.restrictToBounds();
    this.updateCenterPt();
  }

  restrictToBounds() {
    if (this.y < this.bounds.top) {
      this.y = this.bounds.top;
    }

    if (this.y > this.bounds.bottom) {
      this.y = this.bounds.bottom;
    }
  }
}
