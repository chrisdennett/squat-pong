import { DataPong } from "./dataPong/DataPong.js";

const PongTemplate = document.createElement("template");
PongTemplate.innerHTML = /*html*/ `
    <style></style>
    <svg-pong id="svgPong"></svg-pong>
`;

class Pong extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(PongTemplate.content.cloneNode(true));

    this.defaultGameSettings = {
      gameMode: "onePlayer" /*demo, onePlayer, twoPlayer*/,
      displayWidth: 1100,
      displayHeight: 900,
      delayAfterPoint: 1000,
      delayRestartAfterWin: 2000,
      winningScore: 11,
      useGapBug: false,
      useScoreBasedPaddleSizes: false,
      palette: {
        surround: "#000000",
        inlay: "#4d4d4d",
        screen: "hsl(28, 88%, 33%)",
        paddleLeft: "white",
        paddleRight: "white",
        ball: "white",
        net: "white",
        boundaryLeft: "white",
        boundaryRight: "white",
        boundaryTop: "white",
        boundaryBottom: "white",
        scoreLeft: "purple",
        scoreRight: "yellow",
        text: "white",
      },
      display: {
        showSides: false,
        showNet: true,
        useGooeyFilter: false,
        useTvFilter: false,
        fullCabinet: false,
      },
      bounds: {
        top: 28.2,
        right: 240,
        bottom: 192,
        left: 37,
      },
      ball: {
        serveVx: 1.3,
        serveVy: 0.3,
        vx: 7,
        maxVy: 2,
        size: 9,
      },
      paddle: {
        width: 7,
        height: 25, // 10, 20, 40
        speed: 5,
        computerSpeed: 2,
      },
    };

    this.gameMode = this.defaultGameSettings.gameMode;
    this.isPaused = false;
    this.svgPong = shadow.getElementById("svgPong");
  }

  reset() {
    this.gameMode = "demo";
    this.showNetAndBall();
    this.dataPong.reset(this.gameSettings);
  }

  hideNetAndBall() {
    this.svgPong.hideNetAndBall();
  }

  showNetAndBall() {
    this.svgPong.showNetAndBall();
  }

  setTo2PlayerMode() {
    this.gameMode = "twoPlayer";
    this.dataPong.setGameMode(this.gameMode);
  }

  setTo1PlayerMode() {
    this.gameMode = "onePlayer";
    this.dataPong.setGameMode(this.gameMode);
  }

  setToDemoMode() {
    this.gameMode = "demo";
    this.dataPong.setGameMode(this.gameMode);
  }

  setup(customSettings, soundMachine) {
    this.gameSettings = { ...this.defaultGameSettings, ...customSettings };
    this.dataPong = new DataPong({
      ...this.defaultGameSettings,
      ...customSettings,
    });

    // even when set to true bubbling doesn't seem to work here
    // so I'm simply passing on the event with a new one
    this.dataPong.addEventListener("paddleStrike", (e) => {
      this.dispatchEvent(new CustomEvent(e.type, { detail: e.detail }));
    });

    this.dataPong.ball.addEventListener("wallStrike", (e) => {
      this.dispatchEvent(new CustomEvent(e.type, { detail: e.detail }));
    });

    this.dataPong.addEventListener("gameOver", (e) => {
      this.dispatchEvent(new CustomEvent(e.type));
    });

    this.svgPong.setup(this.dataPong, soundMachine);
  }

  setPaddleOneY(y) {
    this.dataPong.paddleLeft.setY(y);
  }
  setPaddleTwoY(y) {
    this.dataPong.paddleRight.setY(y);
  }

  get rallyTally() {
    return this.dataPong.rallyTally;
  }

  get paddleOneY() {
    return this.dataPong.paddleLeft.yAsFraction;
  }

  get paddleTwoY() {
    return this.dataPong.paddleRight.yAsFraction;
  }

  //  GETTERS
  get state() {
    return this.dataPong.gameState;
  }

  get score() {
    return this.dataPong.score;
  }

  start() {
    this.showNetAndBall();
    this.dataPong.startGame();
    this.svgPong.draw();
  }

  loop() {
    if (this.isPaused) return;

    this.dataPong.update();
    this.svgPong.draw();
  }
}

customElements.define("p-o-n-g", Pong);
