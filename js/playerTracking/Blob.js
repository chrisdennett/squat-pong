export class Blob {
  constructor(colour, type) {
    this.left = 10000;
    this.top = 10000;
    this.right = 0;
    this.bottom = 0;
    this.width = 0;
    this.height = 0;
    this.centerX = 0;
    this.centerY = 0;
    const h = Math.round(Math.random() * 360);
    this.type = type; // "p1" or "p2"
    this.fill = colour || `hsl(${h},50%, 50%)`;
    // this.stroke = `hsl(${h},80%, 40%)`;
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

  display(ctx, colour) {
    ctx.strokeStyle = colour || this.fill;
    // ctx.strokeStyle = this.stroke;
    const x = this.left;
    const y = this.top;
    const w = this.width;
    const h = this.height;

    if (w > 0) {
      ctx.strokeRect(x, y, w, h);
      // ctx.strokeRect(x, y, w, h);
    }
  }

  static isWithinTolerance(colour1, colour2, tolerance) {
    // test hue
    const minR = colour1.h - tolerance;
    const maxR = colour1.h + tolerance;
    if (colour2.h < minR || colour2.h > maxR) {
      return false;
    }

    // test saturation
    const minG = colour1.s - tolerance;
    const maxG = colour1.s + tolerance;
    if (colour2.s < minG || colour2.s > maxG) {
      return false;
    }

    // test lightness
    const minB = colour1.l - tolerance;
    const maxB = colour1.l + tolerance;
    if (colour2.l < minB || colour2.l > maxB) {
      return false;
    }

    // all matches.  Yay!
    return true;
  }
}
