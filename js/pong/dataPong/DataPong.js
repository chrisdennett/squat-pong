// import { playInstruction } from "../../sound/soundFilePlayer.js";
import { SoundMachine } from "../../sound/soundMachine.js";
import { DataBall } from "./DataBall.js";
import { DataInputs } from "./DataInputs.js";
import { DataPaddle } from "./DataPaddle.js";

export class DataPong extends EventTarget {
  constructor(params) {
    super();

    const {
      bounds,
      paddle,
      ball,
      winningScore,
      gameMode,
      display,
      displayWidth,
      displayHeight,
      palette,
    } = params;

    this.soundMachine = new SoundMachine();
    this.rallyTally = 0;
    this.bounds = bounds;
    this.displayWidth = displayWidth;
    this.displayHeight = displayHeight;
    this.palette = palette;
    this.showSides = display.showSides;
    this.winningScore = winningScore; // set here for convenience
    // demo, onePlayer, twoPlayer,
    // demoDoubles, onePlayerDoubles, twoPlayerDoubles
    this.params = params;
    this.gameMode = gameMode;
    this.gameState = "playing"; // "playing", "gameOver"
    this.winner = "NULL";
    this.score = { p1: 0, p2: 0 };
    this.serveLeft = false;
    this.ball = new DataBall({ bounds, ...ball });
    this.paddleLeft = new DataPaddle({ bounds, ...paddle, type: "left" });
    this.paddleRight = new DataPaddle({ bounds, ...paddle, type: "right" });
    this.dataInputs = new DataInputs({});
    this.serveTimerCount = 3;
    this.showServeMarker = "none";
  }

  reset() {
    this.gameState = "playing"; // "playing", "gameOver"
    this.winner = "NULL";
    this.score = { p1: 0, p2: 0 };
    this.paddleLeft.reset();
    this.paddleRight.reset();
    this.ball.reset();
    this.serveLeft = false;
    this.rallyTally = 0;
  }

  setGameMode(mode) {
    this.gameMode = mode;
    if (this.gameMode === "onePlayer") {
      this.paddleRight.speed = this.params.paddle.computerSpeed;
    }
  }

  startGame() {
    this.gameState = "playing";
    this.score = { p1: 0, p2: 0 };
    this.paddleLeft.reset();
    this.paddleRight.reset();
    this.serve();
  }

  serve() {
    // playInstruction("serveCountdown");
    this.soundMachine.playNote(1);
    this.serveTimerCount = 6;
    const serveMarkerType = this.serveLeft ? "left" : "right";
    this.showServeMarker = serveMarkerType;

    const timer1 = setInterval(() => {
      this.showServeMarker =
        this.showServeMarker === "none" ? serveMarkerType : "none";
      this.serveTimerCount--;
      this.soundMachine.playNote(1);
      // this.showServeMarker = this.serveLeft ? "left" : "right";
      if (this.serveTimerCount <= 0) {
        clearInterval(timer1);
        this.showServeMarker = "none";
        this.rallyTally = 0;
        this.soundMachine.playNote(2);
        this.ball.serve(this.serveLeft);
        this.serveLeft = !this.serveLeft;
      }
    }, 500);
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
      this.dispatchEvent(
        new CustomEvent("gameOver", { bubbles: false, detail: "gameOver" })
      );
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
    const contactMinY = paddle.y - (this.ball.size + 1);
    const contactMaxY = paddle.y + paddle.height + 1;

    const contact =
      // below the top of the paddle
      this.ball.y >= contactMinY &&
      // above the bottom of the paddle
      this.ball.y <= contactMaxY;

    let offsetAsFraction = null;

    if (contact) {
      const strikeYRelaiveToPaddle = this.ball.centerPt.y - paddle.centerPt.y;
      this.rallyTally++;

      // max offset for center pt of ball is the paddle height PLUS half
      // the ball height (radius) at the top and at the bottom
      const maxOffset = paddle.height / 2 + this.ball.radius;

      // gives value between -1 and 1
      offsetAsFraction = strikeYRelaiveToPaddle / maxOffset;

      this.dispatchEvent(
        new CustomEvent("paddleStrike", {
          bubbles: false,
          detail: { detail: "player1", offsetAsFraction },
        })
      );
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
