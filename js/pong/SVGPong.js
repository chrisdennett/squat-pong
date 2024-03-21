const template = document.createElement("template");
template.innerHTML = /*html*/ `
    <style>
        #surround{
            padding: 5px;
            display: inline-block;
        }

        #gradientOverlay {
            mix-blend-mode: hard-light;
            opacity: 0.5;
        }

        #gradientOverlay::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: linear-gradient(
                to bottom,
                rgba(255, 255, 255, 0.1) 1px,
                transparent 1px
            );
            background-size: 100% 4px;
            pointer-events: none;
        }
    </style>
    <div id="surround">
        <svg id="svgPong" viewBox="0 0 278.7 219.5">
            <defs id="defs1">
                <mask id="screenMask">
                    <path fill="rgba(255,255,255,0.6)" d="M34.6 17.3c11.4-1.5 47.3-7 104.4-7 63.7 0 87.9 3 104 5.6 16 2.5 18.2 6.3 20.5 16.9 1.5 7.1 4.8 44.9 4.5 82.8-.3 36.4-1.5 60.8-3.9 71.4-2.3 10.5-4.6 14.5-21.6 16.8-17 2.3-49 6-107.3 6-58.2 0-85.3-4.3-100-6-14.8-1.7-18.5-5.8-21-16.7a373 373 0 0 1-5.3-68.6 835 835 0 0 1 4.6-85.8c1.7-10.3 9.7-14 21.1-15.4Z"></path>
                </mask>
            
                <filter id="oldTVFilter">
                    <feTurbulence
                    type="fractalNoise"
                    baseFrequency="3.51"
                    numOctaves="3"
                    stitchTiles="stitch"
                    />
                </filter>
                <radialGradient
                    xlink:href="#linearGradient5"
                    id="radialGradient6"
                    cx="152.9"
                    cy="119.3"
                    r="129.5"
                    fx="152.9"
                    fy="119.3"
                    gradientTransform="matrix(1.30642 -.01269 .00828 .85302 -42.1 53.9)"
                    gradientUnits="userSpaceOnUse"
                />
                <linearGradient id="linearGradient5">
                    <stop
                    id="stop5"
                    offset="0"
                    stop-color="#f9f9f9"
                    stop-opacity=".4"
                    />
                    <stop
                    id="stop7"
                    offset=".5"
                    stop-color="#fcfcfc"
                    stop-opacity=".3"
                    />
                    <stop id="stop6" offset="1" stop-color="#fff" stop-opacity=".1" />
                </linearGradient>

    
                <linearGradient id="inlayGradient" gradientTransform="rotate(90)">
                    <stop offset="0%" stop-color="rgba(0,0,0,0.5)" />
                    <stop offset="10%" stop-color="rgba(0,0,0,0.2)" />
                    <stop offset="90%" stop-color="rgba(0,0,0,0.2)" />
                    <stop offset="100%" stop-color="rgba(0,0,0,0.5)" />
                </linearGradient>

                <!-- <filter
                    style="color-interpolation-filters:sRGB"
                    id="a"
                    x="-0.06468828"
                    y="-0.075397916"
                    width="1.1293766"
                    height="1.1507958">
                    
                    <feGaussianBlur id="blurFilter" stdDeviation="2.5"/>
                    <feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 30 -10" />
                </filter> -->

            </defs>

        <g id="game">

        <!-- OUTER BIT -->
            <path
                id="inlay"
                fill="#3783fa"
                stroke="none"
                d="M28.3 7.7C40.5 6 79 0 140.3 0c68.3 0 91.5 3.5 108.7 6.2 17.3 2.8 23 10.6 25.5 22.2 1.7 8 4.5 45.7 4.2 87.4-.3 40-1.2 66.2-3.7 77.8-2.6 11.6-10.6 17.5-28.8 20-18.3 2.5-47.5 5.9-110 5.9s-95-5.5-107.4-6.7c-12.3-1.2-21.7-8.3-24.3-20.3C1.8 180.5 0 157 0 119s2-77.2 3.8-88.5A29 29 0 0 1 28.3 7.7Z"
            />
            <path
                id="inlayShadowOverlay"
                fill="url(#inlayGradient)"
                stroke="none"
                d="M28.3 7.7C40.5 6 79 0 140.3 0c68.3 0 91.5 3.5 108.7 6.2 17.3 2.8 23 10.6 25.5 22.2 1.7 8 4.5 45.7 4.2 87.4-.3 40-1.2 66.2-3.7 77.8-2.6 11.6-10.6 17.5-28.8 20-18.3 2.5-47.5 5.9-110 5.9s-95-5.5-107.4-6.7c-12.3-1.2-21.7-8.3-24.3-20.3C1.8 180.5 0 157 0 119s2-77.2 3.8-88.5A29 29 0 0 1 28.3 7.7Z"
            />
         
            <!-- INNER SCREEN AREA -->
            <path
                id="screen"
                fill="#3584fb"
                stroke="none"
                d="M34.6 17.3c11.4-1.5 47.3-7 104.4-7 63.7 0 87.9 3 104 5.6 16 2.5 18.2 6.3 20.5 16.9 1.5 7.1 4.8 44.9 4.5 82.8-.3 36.4-1.5 60.8-3.9 71.4-2.3 10.5-4.6 14.5-21.6 16.8-17 2.3-49 6-107.3 6-58.2 0-85.3-4.3-100-6-14.8-1.7-18.5-5.8-21-16.7a373 373 0 0 1-5.3-68.6 835 835 0 0 1 4.6-85.8c1.7-10.3 9.7-14 21.1-15.4Z"
            />
            <path
                id="screenShine"
                fill="url(#radialGradient6)"
                stroke="none"
                d="M35.5 17.3c11.4-1.5 47.3-7 104.4-7 63.7 0 87.9 3 104 5.6 16 2.5 18.2 6.3 20.5 16.9 1.5 7.1 4.8 44.9 4.5 82.8-.3 36.4-1.5 60.8-3.9 71.4-2.3 10.5-4.6 14.5-21.6 16.8-17 2.3-49 6-107.3 6-58.2 0-85.3-4.3-100-6-14.8-1.7-18.5-5.8-21-16.7a373 373 0 0 1-5.3-68.6 835 835 0 0 1 4.6-85.8c1.7-10.3 9.7-14 21.1-15.4Z"
            />
            <path
                id="gradientOverlay"
                mask="url(#screenMask)"
                filter="url(#oldTVFilter)"
                fill="none"
                stroke="none"
                d="M34.6 17.3c11.4-1.5 47.3-7 104.4-7 63.7 0 87.9 3 104 5.6 16 2.5 18.2 6.3 20.5 16.9 1.5 7.1 4.8 44.9 4.5 82.8-.3 36.4-1.5 60.8-3.9 71.4-2.3 10.5-4.6 14.5-21.6 16.8-17 2.3-49 6-107.3 6-58.2 0-85.3-4.3-100-6-14.8-1.7-18.5-5.8-21-16.7a373 373 0 0 1-5.3-68.6 835 835 0 0 1 4.6-85.8c1.7-10.3 9.7-14 21.1-15.4Z"
            />

            <!-- GAME ELEMENTS -->
            <g>
                <g id="net" style="display: none">
                    <path
                        id="netTop"
                        fill="#f0f"
                        stroke="#fff"
                        stroke-dasharray="3.7 3.7"
                        stroke-dashoffset="0"
                        stroke-linecap="butt"
                        stroke-linejoin="miter"
                        stroke-width="6"
                        d="M 138.5 34 v55"
                    />
                    <path
                        id="netMiddle"
                        fill="#f0f"
                        stroke="#fff"
                        stroke-dasharray="3.7 3.7"
                        stroke-dashoffset="0"
                        stroke-linecap="butt"
                        stroke-linejoin="miter"
                        stroke-width="6"
                        d="M 138.5 89 v55"
                    />
                    <path
                        id="netBottom"
                        fill="#f0f"
                        stroke="#fff"
                        stroke-dasharray="3.7 3.7"
                        stroke-dashoffset="0"
                        stroke-linecap="butt"
                        stroke-linejoin="miter"
                        stroke-width="6"
                        d="M 138.5 147 v40"
                    />
                </g>
                <path
                    id="fullNet"
                    style="display: inherit"
                    fill="#f0f"
                    stroke="#fff"
                    stroke-dasharray="3.7 3.7"
                    stroke-dashoffset="0"
                    stroke-linecap="butt"
                    stroke-linejoin="miter"
                    stroke-width="5.3"
                    d="M138.7 30.7v161.8"
                />
                <path
                    id="leftBoundary"
                    fill="#f0f"
                    stroke="#fff"
                    stroke-dasharray="1.1"
                    stroke-dashoffset="0"
                    stroke-linecap="butt"
                    stroke-linejoin="miter"
                    stroke-width="5"
                    d="M34.3 25.3v171"
                />
                <path
                    id="rightBoundary"
                    fill="#f0f"
                    stroke="#fff"
                    stroke-dasharray="1.1"
                    stroke-dashoffset="0"
                    stroke-linecap="butt"
                    stroke-linejoin="miter"
                    stroke-width="5"
                    d="M242.6 25.6v171"
                />
                <path
                    id="topBoundary"
                    fill="#f0f"
                    stroke="#fff"
                    stroke-dasharray="5.3 4"
                    stroke-dashoffset="0"
                    stroke-linecap="butt"
                    stroke-linejoin="miter"
                    stroke-width="3"
                    d="M238.1 26.8 H36.6"
                />
                <path
                    id="bottomBoundary"
                    fill="#f0f"
                    stroke="#fff"
                    stroke-dasharray="5.3 4"
                    stroke-dashoffset="0"
                    stroke-linecap="butt"
                    stroke-linejoin="miter"
                    stroke-width="3"
                    d="M238.1 193.5 H36.6"
                />
                <text
                    id="scoreLeft"
                    x="88"
                    y="65"
                    fill="#f9f9f9"
                    stroke="none"
                    font-family="press_start_2pregular"
                    font-size="32"
                    font-weight="900"
                    letter-spacing="2.5"
                    text-anchor="middle"
                >
                    0
                </text>
                <text
                    id="scoreRight"
                    x="188"
                    y="65"
                    fill="#f9f9f9"
                    stroke="none"
                    font-family="press_start_2pregular"
                    font-size="32"
                    font-weight="900"
                    letter-spacing="2.5"
                    text-anchor="middle"
                >
                    0
                </text>

                <g id="svgBall">
                    <path id="ballPath" stroke="none" d="M0 0 h5 v5 h-5z" />
                </g>

                <g id="paddleLeft">
                    <path id="paddleLeftPath" stroke="none" d="M0 0 h5 v20 h-5z" />
                </g>

                <g id="paddleRight">
                    <path id="paddleRightPath" stroke="none" d="M0 0 h5 v20 h-5z" />
                </g>
            </g>
       
            <g id="gameOverContent">
                <text
                id="gameOver"
                x="139"
                y="118"
                fill="#f9f9f9"
                stroke="none"
                font-family="press_start_2pregular"
                font-size="18"
                font-weight="900"
                letter-spacing="2.5"
                text-anchor="middle"
                >
                GAME OVER
                </text>
                <text
                id="gameOverWinnerText"
                x="139"
                y="132"
                fill="#f9f9f9"
                stroke="none"
                font-family="press_start_2pregular"
                font-size="10"
                font-weight="900"
                letter-spacing="2.5"
                text-anchor="middle"
                >
                PLAYER X WINS
                </text>
            </g>
       
        </g>   
    </svg>
    </div>
`;
class SvgPong extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.append(template.content.cloneNode(true));

    this.svg = shadow.getElementById("svgPong");
    // game elements
    this.ballElem = shadow.getElementById("svgBall");
    this.leftPaddle = shadow.getElementById("paddleLeft");
    this.rightPaddle = shadow.getElementById("paddleRight");

    // score text
    this.scoreLeft = shadow.getElementById("scoreLeft");
    this.scoreRight = shadow.getElementById("scoreRight");

    // game over content
    this.gameOverContent = shadow.getElementById("gameOverContent");
    this.gameOverWinnerText = shadow.getElementById("gameOverWinnerText");

    // set paddle/ball sizes
    this.paddleLeftPath = shadow.getElementById("paddleLeftPath");
    this.paddleRightPath = shadow.getElementById("paddleRightPath");
    this.ballPath = shadow.getElementById("ballPath");

    // boundaries
    this.leftBoundary = shadow.getElementById("leftBoundary");
    this.rightBoundary = shadow.getElementById("rightBoundary");
    this.topBoundary = shadow.getElementById("topBoundary");
    this.bottomBoundary = shadow.getElementById("bottomBoundary");

    // surround, screen and inlay
    this.surround = shadow.getElementById("surround");
    this.inlay = shadow.getElementById("inlay");
    this.screen = shadow.getElementById("screen");
  }

  setup(dataPong) {
    this.dataPong = dataPong;
    this.bounds = dataPong.bounds;

    // outer size
    this.svg.setAttribute("width", `${dataPong.displayWidth}px`);

    // paddle sizes
    this.paddleLeftPath.setAttribute(
      "d",
      `M0 0 h${dataPong.paddleLeft.width} v${dataPong.paddleLeft.height} h-${dataPong.paddleLeft.width}z`
    );
    this.paddleRightPath.setAttribute(
      "d",
      `M0 0 h${dataPong.paddleRight.width} v${dataPong.paddleRight.height} h-${dataPong.paddleRight.width}z`
    );

    // ball size
    this.ballPath.setAttribute(
      "d",
      `M0 0 h${dataPong.ball.size} v${dataPong.ball.size} h-${dataPong.ball.size}z`
    );

    // show / hide sides
    if (!this.dataPong.showSides) {
      this.leftBoundary.style.display = "none";
      this.rightBoundary.style.display = "none";
    }

    // boundary colours
    this.leftBoundary.style.stroke = dataPong.palette.boundaryLeft;
    this.rightBoundary.style.stroke = dataPong.palette.boundaryRight;
    this.topBoundary.style.stroke = dataPong.palette.boundaryTop;
    this.bottomBoundary.style.stroke = dataPong.palette.boundaryBottom;

    // paddle colours
    this.leftPaddle.style.fill = dataPong.palette.paddleLeft;
    this.rightPaddle.style.fill = dataPong.palette.paddleRight;

    // ball colour
    this.ballElem.style.fill = dataPong.palette.ball;

    // screen colours
    this.inlay.style.fill = dataPong.palette.inlay;
    this.screen.style.fill = dataPong.palette.screen;
    this.surround.style.background = dataPong.palette.surround;

    // this.hideGameOverScreen();
    // this.showGameOverScreen();
  }

  showGameOverScreen() {
    this.gameOverContent.style.display = "inherit";

    const playerTwoWon = this.dataPong.winner === "p2";
    const winText = `PLAYER ${playerTwoWon ? "2" : "1"} WINS`;

    this.gameOverWinnerText.innerHTML = winText;
  }

  hideGameOverScreen() {
    this.gameOverContent.style.display = "none";
  }

  draw() {
    this.ballElem.style.fill = this.dataPong.ball.colour;

    if (this.dataPong.gameState === "gameOver") {
      this.showGameOverScreen();
    } else {
      this.hideGameOverScreen();
    }

    if (this.dataPong.gameState === "playing") {
      this.positionElement(
        this.ballElem,
        this.dataPong.ball.x,
        this.dataPong.ball.y
      );
      this.positionElement(
        this.leftPaddle,
        this.dataPong.paddleLeft.x,
        this.dataPong.paddleLeft.y
      );
      this.positionElement(
        this.rightPaddle,
        this.dataPong.paddleRight.x,
        this.dataPong.paddleRight.y
      );
    }

    this.scoreLeft.innerHTML = this.dataPong.score.p1;
    this.scoreRight.innerHTML = this.dataPong.score.p2;
  }

  positionElement(element, x, y) {
    element.style.transform = `translate(${x}px, ${y}px)`;
  }
}

customElements.define("svg-pong", SvgPong);
