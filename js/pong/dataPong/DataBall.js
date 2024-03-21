export class DataBall {
  constructor(params) {
    this.params = params;
    this.colour = params.colour;
    this.bounds = params.bounds;
    this.maxVy = params.maxVy;
    this.size = this.params.size;
    this.radius = this.size / 2;
    // sets this.  x, y, vx, vy, centerPt
    this.reset();
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.restictToBounds();
    this.updateCenterPt();
  }

  updateCenterPt() {
    this.centerPt = {
      x: this.x + this.radius,
      y: this.y + this.radius,
    };
  }

  center() {
    const w = this.bounds.right - this.bounds.left;
    const h = this.bounds.bottom - this.bounds.top;
    this.x = this.bounds.left + w / 2 - this.radius;
    this.y = this.bounds.top + h / 2 - this.radius;
    this.updateCenterPt();
  }

  reset() {
    this.center();
    this.vx = 0;
    this.vy = 0;
  }

  serve(toLeft) {
    this.center();
    this.vx = toLeft ? -this.params.serveVx : this.params.serveVx;
    this.vy = Math.random() < 0.5 ? this.params.serveVy : -this.params.serveVy;
  }

  return(paddleOffset) {
    // set y speed relative to distance from paddle center the ball strikes
    this.vy = paddleOffset * this.maxVy;

    // reverse x velocity
    this.vx = -this.vx;
    // ramp up speed from initial serve vx to full speed
    this.adjustXSpeed();

    // alter vy based on paddle offset
  }

  adjustXSpeed() {
    const isNegative = this.vx < 1;

    if (Math.abs(this.vx) < this.params.vx) {
      let inc = 0.1;
      if (isNegative) {
        inc = -inc;
      }
      this.vx += inc;
    }
  }

  restictToBounds() {
    if (this.y > this.bounds.bottom - this.size) {
      this.y = this.bounds.bottom - this.size;
      this.vy = -this.vy;
    }

    if (this.y < this.bounds.top) {
      this.y = this.bounds.top;
      this.vy = -this.vy;
    }

    // // only needed if want the ball to bound off the side walls
    // if (this.x > this.bounds.right - this.width) {
    //   this.x = this.bounds.right - this.width;
    //   this.vx = -this.vx;
    // }
    // if (this.x < this.bounds.left) {
    //   this.x = this.bounds.left;
    //   this.vx = -this.vx;
    // }
  }
}
