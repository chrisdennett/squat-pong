export class BeatBar {
  constructor(parentElement, x, y, w, h) {
    this.beatBarElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    this.beatBarElement.setAttribute("fill", `rgb(255,255,255)`);
    this.beatBarElement.setAttribute("d", `M${x} ${y} h${w} v${h} h-${w}z`);
    this.beatBarElement.style.opacity = 0;

    this.x = x;
    this.width = w;
    this.right = x + w;

    parentElement.appendChild(this.beatBarElement);
  }

  checkCollision(ball) {
    if (ball.x > this.x && ball.x < this.right) {
      this.beatBarElement.style.opacity = 0.1;
    } else {
      this.beatBarElement.style.opacity = 0;
    }
  }
}
