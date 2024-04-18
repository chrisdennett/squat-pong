export class BeatBar extends EventTarget {
  constructor({ parentElement, index, x, y, w, h, isOnLeft, isOnRight, note }) {
    super();
    this.note = note;
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

    const markerWidth = w; //1;
    this.beatBarElement.setAttribute("fill", "yellow");
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
    this.beatBarText.setAttribute("y", y + h / 2);
    this.beatBarText.setAttribute("font-size", 4);
    this.beatBarText.setAttribute("fill", "yellow");
    this.beatBarText.setAttribute("text-anchor", "middle");
    this.beatBarText.style.opacity = 0.2;
    this.beatBarText.innerHTML = note.name;

    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.right = x + w;
    this.index = index;
    this.isLastHit = false;

    this.beatBarGroup.appendChild(this.beatBarElement);
    this.beatBarGroup.style.transform = `translate(${x}px, ${y}px)`;

    parentElement.appendChild(this.beatBarGroup);
    parentElement.appendChild(this.beatBarText);
  }

  update(ball) {
    this.checkCollision(ball);
    if (this.note) {
      this.beatBarText.innerHTML = this.note.name;
    }
  }

  checkCollision(ball) {
    const insideLeftEdge = this.isOnLeft || ball.x + ball.radius >= this.x;
    const insideRightEdge =
      this.isOnRight || ball.x + ball.radius <= this.right;
    const insideTopEdge = ball.y + ball.radius >= this.y;
    const insideBottomEdge = ball.y + ball.radius <= this.y + this.height;

    if (
      insideLeftEdge &&
      insideRightEdge &&
      insideTopEdge &&
      insideBottomEdge
    ) {
      // this.beatBarElement.style.opacity = 0;
      if (this.isLastHit === false) {
        // this.beatBarGroup.style.transform = `translate(${ball.x}px, ${this.y}px)`;
        this.beatBarElement.style.opacity = 0.2;

        this.beatBarText.style.opacity = 1;
        this.isLastHit = true;
        this.dispatchEvent(
          new CustomEvent("beatBarHit", {
            bubbles: true,
            detail: { note: this.note },
          })
        );
      }
    } else {
      this.beatBarText.style.opacity = 0.5;
      this.beatBarElement.style.opacity = 0;
      this.isLastHit = false;
    }
  }
}
