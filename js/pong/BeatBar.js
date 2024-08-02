export class BeatBar extends EventTarget {
  constructor({ parentElement, index, x, y, w, h, isOnLeft, isOnRight, note }) {
    super();

    this.isOnLeft = isOnLeft;
    this.isOnRight = isOnRight;
    this.beatBarGroup = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    this.beatBarElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );

    const markerWidth = 1; // w
    this.beatBarElement.setAttribute("fill", "#ff7800");
    this.beatBarElement.setAttribute(
      "d",
      `M${0} ${0} h${markerWidth} v${h} h-${markerWidth}z`
    );
    this.beatBarElement.style.opacity = index === 0 ? 0 : 1;

    this.beatBarText = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    this.beatBarText.setAttribute("x", x + w / 2);
    this.beatBarText.setAttribute("y", y - 5);
    this.beatBarText.setAttribute("font-size", 4);
    this.beatBarText.setAttribute("fill", "#ff7800");
    this.beatBarText.setAttribute("text-anchor", "middle");
    this.beatBarText.style.opacity = 0.2;
    this.beatBarText.innerHTML = note.name;

    this.x = x;
    this.y = y;
    this.width = w;
    this.right = x + w;
    this.index = index;
    this.isLastHit = false;

    this.beatBarGroup.appendChild(this.beatBarElement);
    this.beatBarGroup.style.transform = `translate(${x}px, ${y}px)`;

    parentElement.appendChild(this.beatBarGroup);
    parentElement.appendChild(this.beatBarText);
  }

  update(ball, notes) {
    this.checkCollision(ball);
    if (notes) {
      const note = notes[this.index];
      this.beatBarText.innerHTML = note.name;
    }
  }

  checkCollision(ball) {
    const insideLeftEdge = this.isOnLeft || ball.x + ball.radius >= this.x;
    const insideRightEdge =
      this.isOnRight || ball.x + ball.radius <= this.right;

    if (this.beatBarElement.style.opacity > 0) {
      this.beatBarElement.style.opacity -= 0.1;
    }

    if (insideLeftEdge && insideRightEdge) {
      // this.beatBarElement.style.opacity = 0;
      if (this.isLastHit === false) {
        // this.beatBarGroup.style.transform = `translate(${ball.x}px, ${this.y}px)`;
        this.beatBarElement.style.opacity = 0.6;

        this.beatBarText.style.opacity = 1;
        this.isLastHit = true;

        this.beatBarGroup.style.transform = `translate(${
          ball.x + ball.radius
        }px, ${this.y}px)`;

        this.dispatchEvent(
          new CustomEvent("beatBarHit", {
            bubbles: true,
            detail: { index: this.index },
          })
        );
      }
    } else {
      this.beatBarText.style.opacity = 0.3;
      this.beatBarElement.style.opacity = 0;
      this.isLastHit = false;
    }
  }
}
