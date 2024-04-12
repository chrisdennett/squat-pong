export class BeatBar extends EventTarget {
  constructor(parentElement, index, x, y, w, h, isOnLeft, isOnRight) {
    super();

    this.isOnLeft = isOnLeft;
    this.isOnRight = isOnRight;
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
    this.index = index;
    this.isLastHit = false;

    parentElement.appendChild(this.beatBarElement);
  }

  checkCollision(ball) {
    const insideLeftEdge = this.isOnLeft || ball.x + ball.radius >= this.x;
    const insideRightEdge =
      this.isOnRight || ball.x + ball.radius <= this.right;

    if (insideLeftEdge && insideRightEdge) {
      this.beatBarElement.style.opacity = 0.1;

      if (this.isLastHit === false) {
        this.isLastHit = true;
        this.dispatchEvent(
          new CustomEvent("beatBarHit", {
            bubbles: true,
            detail: { index: this.index },
          })
        );
      }
    } else {
      this.beatBarElement.style.opacity = 0;
      this.isLastHit = false;
    }
  }
}
