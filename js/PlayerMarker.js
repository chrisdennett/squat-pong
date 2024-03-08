export class PlayerMarker {
  constructor(blob1, blob2) {
    if (blob1 && blob2) {
      this.update(blob1, blob2);
    }
  }

  update(blob1, blob2) {
    this.left = Math.min(blob1.left, blob2.left);
    this.right = Math.max(blob1.right, blob2.right);
    this.top = Math.min(blob1.top, blob2.top);
    this.bottom = Math.max(blob1.bottom, blob2.bottom);
    this.width = this.right - this.left;
    this.height = this.bottom - this.top;
    this.middleY = this.top + this.height / 2;
  }

  display(ctx) {
    ctx.strokeStyle = "yellow";
    ctx.fillStyle = "yellow";
    ctx.strokeRect(this.left, this.top, this.width, this.height);
    ctx.fillRect(this.left, this.middleY - 1, this.width, 2);
    ctx.strokeText("PLAYER ONE", this.left, this.top);
    ctx.fillStyle = "red";
    ctx.font = "20px Arial";
    ctx.fillText("PLAYER ONE", this.left, this.top);
  }
}
