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
      gameMode: "twoPlayer" /*demo, onePlayer, twoPlayer*/,
      displayWidth: 350,
      delayAfterPoint: 1000,
      delayRestartAfterWin: 2000,
      winningScore: 11,
      useGapBug: false,
      useScoreBasedPaddleSizes: false,
      palette: {
        surround: "#7d7d7d",
        inlay: "#4d4d4d",
        screen: "#0e0e0e",
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
        useGooeyFilter: true,
        useTvFilter: true,
        fullCabinet: false,
      },
      bounds: {
        top: 28.2,
        right: 240,
        bottom: 192,
        left: 37,
      },
      ball: {
        serveVx: 2,
        serveVy: 1,
        vx: 7,
        maxVy: 3,
        size: 5,
      },
      paddle: {
        width: 5,
        height: 20,
        speed: 5,
        computerSpeed: 2,
      },
    };

    this.gameMode = this.defaultGameSettings.gameMode;

    this.svgPong = shadow.getElementById("svgPong");
  }

  setup(customSettings, soundMachine) {
    this.dataPong = new DataPong(
      {
        ...this.defaultGameSettings,
        ...customSettings,
      },
      this.onGameEvent
    );

    // even when set to true bubbling doesn't seem to work here
    // so I'm simply passing on the event with a new one
    this.dataPong.addEventListener("paddleStrike", (e) => {
      this.dispatchEvent(new CustomEvent(e.type, { detail: e.detail }));
    });

    this.dataPong.ball.addEventListener("wallStrike", (e) => {
      this.dispatchEvent(new CustomEvent(e.type, { detail: e.detail }));
    });

    this.svgPong.setup(this.dataPong, soundMachine);
  }

  onGameEvent(event) {
    console.log("event: ", event);
  }

  setPaddleOneY(y) {
    this.dataPong.paddleLeft.setY(y);
  }
  setPaddleTwoY(y) {
    this.dataPong.paddleRight.setY(y);
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
    this.dataPong.startGame();
    this.svgPong.draw();
  }

  loop() {
    this.dataPong.update();
    this.svgPong.draw();
  }
}

customElements.define("p-o-n-g", Pong);
