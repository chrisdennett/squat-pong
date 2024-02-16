export class TrackingBlob {
  constructor() {
    this.left = 10000;
    this.top = 10000;
    this.right = 0;
    this.bottom = 0;
    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;
    const h = Math.round(Math.random() * 360);
    this.fill = `hsl(${h},50%, 50%)`;
  }

  clear() {
    this.left = 10000;
    this.top = 10000;
    this.right = 0;
    this.bottom = 0;
    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;
  }

  addIfWithinRange(x, y, maxDistance) {
    const isWithinRange =
      Math.abs(x - this.centerX) <= maxDistance &&
      Math.abs(y - this.centerY) <= maxDistance;

    const yesAddToBlob = isWithinRange || this.centerX === 0;

    if (yesAddToBlob) {
      // adjust blob to contain x and y
      if (x < this.left) {
        this.left = x;
      }
      if (x > this.right) {
        this.right = x;
      }

      if (y < this.top) {
        this.top = y;
      }
      if (y > this.bottom) {
        this.bottom = y;
      }

      this.width = this.right - this.left;
      this.height = this.bottom - this.top;
      this.centerX = this.left + this.width / 2;
      this.centerY = this.top + this.height / 2;
    }

    return yesAddToBlob;
  }

  display(ctx) {
    ctx.fillStyle = this.fill;
    const x = this.left;
    const y = this.top;
    const w = this.width;
    const h = this.height;

    if (w > 0) {
      ctx.fillRect(x, y, w, h);
    }
  }

  static isWithinTolerance(colour1, colour2, tolerance) {
    // test red
    const minR = colour1.r - tolerance;
    const maxR = colour1.r + tolerance;
    if (colour2.r < minR || colour2.r > maxR) {
      return false;
    }

    // if red matches test green
    const minG = colour1.g - tolerance;
    const maxG = colour1.g + tolerance;
    if (colour2.g < minG || colour2.g > maxG) {
      return false;
    }

    // if green matches test blue
    const minB = colour1.b - tolerance;
    const maxB = colour1.b + tolerance;
    if (colour2.b < minB || colour2.b > maxB) {
      return false;
    }

    // all matches.  Yay!
    return true;
  }
}
