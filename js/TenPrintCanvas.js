class TenPrintCanvas extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="outer">
          <style>
              .outer{
                  display: inline-flex;
                  flex-direction: column;
                  margin: 0;
                  align-items: center;
                  justify-content: center;
                  position: relative;
                  min-height: 560px;
              }
  
              #controls {
              padding: 30px;
              display: flex;
              flex-direction: column;
            }
            
            .border {
              box-sizing: border-box;
              position: relative;
              background: black;
              background-image: -webkit-gradient(
                linear,
                right top,
                left bottom,
                from(#333),
                to(#000)
              );
              padding: 20px;
              box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3), 0 0 10px 10px rgba(0, 0, 0, 0.1);
            }
            
            .frame {
              left: 3%;
              top: 2.5%;
              box-shadow: inset 1px 1px 6px rgba(0, 0, 0, 0.8);
              background: white;
              align-items: center;
              display: flex;
              padding: 40px;
              box-sizing: border-box;
            }
            
            .canvas {
              /* box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5); */
              height: 320px;
              width: 320px;
              background-size: cover;
              background-position: center center;
            }
            
            .callback {
              position: absolute;
              font-family: monospace;
              bottom: 10px;
            }
          
          </style>
  
          <div id="controls">
              <label>
                  Number of Cells:
                  <input id="${this.id}_slider1" type="range" min="0" max="1" step="0.001" />
              </label>
  
              <label>
                  Tile Direction Randomness:
                  <input id="${this.id}_slider2" type="range" min="0" max="1" step="0.001" />
              </label>
  
              <label>
                  Hue Randomness:
                  <input id="${this.id}_slider3" type="range" min="0" max="1" step="0.001" />
              </label>
  
              <label>
                  Saturation:
                  <input id="${this.id}_slider4" type="range" min="0" max="1" step="0.001" />
              </label>
          </div>
  
          <div class="border">
              <div class="frame">
                  <canvas id="${this.id}_canvas-1" class="canvas"></canvas>
              </div>
          </div>
      </div>
    `;

    this.init();
  }

  init() {
    this.canvas = document.querySelector(`#${this.id}_canvas-1`);
    this.cellSizeSlider = document.querySelector(`#${this.id}_slider1`);
    this.randomnessSlider = document.querySelector(`#${this.id}_slider2`);
    this.hueSlider = document.querySelector(`#${this.id}_slider3`);
    this.saturationSlider = document.querySelector(`#${this.id}_slider4`);

    this.ctx = this.canvas.getContext("2d");

    // initial settings
    this.canvasSize = 400;
    this.tileTypes = []; // array to persist random true/false values
    this.cols = 10;
    this.rows = 10;
    this.cellSize = this.canvasSize / this.cols;
    this.randomness = 0.2;
    this.hue = 0.2;
    this.saturation = 0.2;

    // cols/rows/cell size slider
    this.minCols = 8;
    this.maxCols = 40;
    this.range = this.maxCols - this.minCols;
    this.cellSizeSlider.value = this.cols / this.maxCols;
    this.cellSizeSlider.addEventListener("input", (e) => {
      this.cols = this.minCols + parseFloat(e.target.value) * this.range;
      this.rows = this.cols;
      this.cellSize = this.canvasSize / this.cols;
      this.createArt();
    });

    // randomness slider
    this.randomnessSlider.addEventListener("input", (e) => {
      this.randomness = parseFloat(e.target.value);
      this.createArt();
    });

    // hue randomness slider
    this.hueSlider.addEventListener("input", (e) => {
      this.hue = parseFloat(e.target.value);
      this.createArt();
    });

    // saturation randomness slider
    this.saturationSlider.addEventListener("input", (e) => {
      this.saturation = parseFloat(e.target.value);
      this.createArt();
    });

    // Run
    this.createArt();
  }

  // functions
  drawTile(x, y, cellSize, tileInfo) {
    this.ctx.beginPath();
    if (tileInfo.leftToRight) {
      this.ctx.moveTo(x, y);
      this.ctx.lineTo(x + cellSize, y + cellSize);
    } else {
      this.ctx.moveTo(x + cellSize, y);
      this.ctx.lineTo(x, y + cellSize);
    }

    this.ctx.strokeStyle = tileInfo.stroke;
    this.ctx.stroke();
  }

  getTileType(col, row) {
    // add array for row if isn't there
    if (this.tileTypes.length <= row) {
      this.tileTypes.push([]);
    }

    let currRow = this.tileTypes[row];

    // add new random cell if not already there
    if (currRow.length <= col) {
      currRow.push(this.getRandomTileInfo());
    }

    // randomise it if it meets the threshold
    if (Math.random() < this.randomness) {
      currRow[col] = this.getRandomTileInfo();
    }

    return currRow[col];
  }

  getRandomTileInfo() {
    return {
      leftToRight: Math.random() >= 0.5,
      stroke: `hsl(${Math.round(this.hue * 360)}, ${Math.round(
        this.saturation * 100
      )}%, 50%)`,
    };
  }

  createArt() {
    this.canvas.width = this.canvasSize;
    this.canvas.height = this.canvasSize;

    this.ctx.lineCap = "square";
    this.ctx.lineWidth = 5;

    for (var y = 0; y < this.rows; y++) {
      for (var x = 0; x < this.cols; x++) {
        const leftToRight = this.getTileType(x, y);
        this.drawTile(
          x * this.cellSize,
          y * this.cellSize,
          this.cellSize,
          leftToRight
        );
      }
    }
  }
}

customElements.define("ten-print", TenPrintCanvas);
