export class Root {
  constructor(x, y, ctx) {
    this.x = x;
    this.y = y;
    this.ctx = ctx;
    this.speedX = Math.random() * 4 - 2;
    this.speedY = Math.random() * 4 - 2;
    this.maxSize = Math.random() * 7 + 5;
    this.size = Math.random() * 1 + 2;
    this.vs = Math.random() * 0.2 + 0.05;
    this.angleX = Math.random() * 6.2;
    this.vaX = Math.random() * 0.6 - 0.3;
    this.angleY = Math.random() * 6.2;
    this.vaY = Math.random() * 0.6 - 0.3;
    this.lightness = 10;
    this.hue = Math.random() * 360;
  }

  update() {
    this.x += this.speedX + Math.sin(this.angleX);
    this.y += this.speedY + Math.sin(this.angleY);
    this.size += this.vs;
    this.angleX += this.vaX;
    this.angleY += this.vaY;

    if (this.lightness < 70) {
      this.lightness += 0.5;
    }

    if (this.size < this.maxSize) {
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsl(${this.hue}, 60%, ${this.lightness}%)`;
      this.ctx.fill();
      this.ctx.stroke();

      requestAnimationFrame(() => this.update());
    }
  }
}
