import { DataBall } from "./DataBall.js";
import { DataInputs } from "./DataInputs.js";
import { DataPaddle } from "./DataPaddle.js";

export class DataPong {
  constructor(params) {
    const {
      bounds,
      paddle,
      ball,
      winningScore,
      gameMode,
      display,
      displayWidth,
      palette,
    } = params;

    this.params = params;
    this.displayWidth = displayWidth;
    this.palette = palette;
    this.showSides = display.showSides;
    this.winningScore = winningScore; // set here for convenience
    // demo, onePlayer, twoPlayer,
    // demoDoubles, onePlayerDoubles, twoPlayerDoubles
    this.gameMode = gameMode;
    this.gameState = "playing"; // "playing", "gameOver", "menu"
    this.winner = "NULL";
    this.score = { p1: 0, p2: 0 };
    this.ball = new DataBall({ bounds, ...ball });
    this.paddleLeft = new DataPaddle({ bounds, ...paddle, type: "left" });
    this.paddleRight = new DataPaddle({ bounds, ...paddle, type: "right" });
    if (this.gameMode === "onePlayer") {
      this.paddleRight.speed = paddle.computerSpeed;
    }
    this.dataInputs = new DataInputs({});
    this.serveLeft = false;
  }

  startGame() {
    this.gameState = "playing";
    this.score = { p1: 0, p2: 0 };
    this.paddleLeft.reset();
    this.paddleRight.reset();
    this.serve();
  }

  serve() {
    this.ball.serve(this.serveLeft);
    this.serveLeft = !this.serveLeft;
  }

  update() {
    if (this.gameState !== "playing") {
      return;
    }

    this.checkPointScored();

    this.ball.update();

    if (this.gameMode === "demo") {
      this.paddleLeft.followBall(this.ball);
      this.paddleRight.followBall(this.ball);
    } else {
      // set latest input values
      this.dataInputs.update();

      // player one
      this.updatePaddleWithUserInput(
        this.paddleLeft,
        this.dataInputs.playerOne
      );

      // player two
      if (this.gameMode === "twoPlayer") {
        this.updatePaddleWithUserInput(
          this.paddleRight,
          this.dataInputs.playerTwo
        );
      } else {
        this.paddleRight.followBall(this.ball);
      }
    }
  }

  updatePaddleWithUserInput(paddle, input) {
    if (input.up) {
      paddle.moveUp();
    }

    if (input.down) {
      paddle.moveDown();
    }
  }

  onPointScored(byPlayerOne) {
    // put ball back to center spot
    this.ball.reset();

    // increase the relevant score
    if (byPlayerOne) {
      this.score.p1++;
    } else {
      this.score.p2++;
    }

    const gameOver = this.checkForWinner();
    // game over - start new game after a delay
    if (gameOver) {
      setTimeout(() => {
        // this.startGame();
      }, this.params.delayRestartAfterWin);
    }
    // point over serve after a delay
    else {
      setTimeout(() => {
        this.serve();
      }, this.params.delayAfterPoint);
    }
  }

  checkForWinner() {
    let isWinner = false;

    if (this.score.p1 === this.params.winningScore) {
      this.winner = "p1";
      isWinner = true;
    } else if (this.score.p2 === this.params.winningScore) {
      this.winner = "p2";
      isWinner = true;
    }

    this.gameState = isWinner ? "gameOver" : "playing";

    // if winner show

    return isWinner;
  }

  checkInLeftPaddleHitZone() {
    return this.ball.x <= this.paddleLeft.x + this.paddleLeft.width;
  }

  checkInRightPaddleHitZone() {
    return this.ball.x + this.ball.size >= this.paddleRight.x;
  }

  checkPaddleContact(paddle) {
    const contactMinY = paddle.y - this.ball.size;
    const contactMaxY = paddle.y + paddle.height;

    const contact =
      // below the top of the paddle
      this.ball.y >= contactMinY &&
      // above the bottom of the paddle
      this.ball.y <= contactMaxY;

    let offsetAsFraction = null;

    if (contact) {
      const strikeYRelaiveToPaddle = this.ball.centerPt.y - paddle.centerPt.y;

      // max offset for center pt of ball is the paddle height PLUS half
      // the ball height (radius) at the top and at the bottom
      const maxOffset = paddle.height / 2 + this.ball.radius;

      // gives value between -1 and 1
      offsetAsFraction = strikeYRelaiveToPaddle / maxOffset;
    }

    return { contact, offset: offsetAsFraction };
  }

  checkPointScored() {
    const inLeftPaddleHitZone = this.checkInLeftPaddleHitZone();
    const inRightPaddleHitZone = this.checkInRightPaddleHitZone();

    // LEFT PADDLE
    if (inLeftPaddleHitZone) {
      const { contact, offset } = this.checkPaddleContact(this.paddleLeft);

      if (contact) {
        this.ball.return(offset);
        this.paddleRight.randomPaddleOffset = Math.random();
      } else {
        // missed by left paddle (player one)
        this.onPointScored(false);
      }
    }
    // RIGHT PADDLE
    else if (inRightPaddleHitZone) {
      const { contact, offset } = this.checkPaddleContact(this.paddleRight);

      if (contact) {
        this.ball.return(offset);
        this.paddleLeft.randomPaddleOffset = Math.random();
      } else {
        // missed by right paddle (player two)
        this.onPointScored(true);
      }
    }
  }
}
