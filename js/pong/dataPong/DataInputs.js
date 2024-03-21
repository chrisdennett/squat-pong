export class DataInputs {
  constructor({
    playerOneUpKey = "w",
    playerOneDownKey = "s",
    playerTwoUpKey = "ArrowUp",
    playerTwoDownKey = "ArrowDown",
  }) {
    this.gamepads = navigator.getGamepads();
    this.leftGamePad = this.gamepads.length > 0 ? this.gamepads[0] : null;
    this.rightGamePad = this.gamepads.length > 1 ? this.gamepads[1] : null;
    this.gamepadAxisThreshold = 0.5;

    this.playerOne = { up: false, down: false };
    this.playerTwo = { up: false, down: false };

    document.addEventListener("keydown", (e) => {
      this.reset();

      // player one
      if (e.key === playerOneUpKey) {
        this.playerOne.up = true;
      } else if (e.key === playerOneDownKey) {
        this.playerOne.down = true;
      }
      // player two
      else if (e.key === playerTwoUpKey) {
        this.playerTwo.up = true;
      } else if (e.key === playerTwoDownKey) {
        this.playerTwo.down = true;
      }
    });

    document.addEventListener("keyup", (e) => {
      this.reset();
    });
  }

  update() {
    //
    // game controls don't have events so need to check on each update
    //
    // LEFT CONTROL
    if (this.leftGamePad) {
      // up control
      if (this.leftGamePad.axes[1] < -this.gamepadAxisThreshold) {
        this.reset();
        this.playerOne.up = true;
      }
      // down control
      if (this.leftGamePad.axes[1] > this.gamepadAxisThreshold) {
        this.reset();
        this.playerOne.down = true;
      }
    }
    // RIGHT CONTROL
    if (this.rightGamePad) {
      // up control
      if (this.rightGamePad.axes[1] < -this.gamepadAxisThreshold) {
        this.reset();
        this.playerTwo.up = true;
      }
      // down control
      if (this.rightGamePad.axes[1] > this.gamepadAxisThreshold) {
        this.reset();
        this.playerTwo.down = true;
      }
    }
  }

  reset() {
    this.playerOne = { up: false, down: false };
    this.playerTwo = { up: false, down: false };
  }
}

// function handleGamepadInput() {
//   const gamepads = navigator.getGamepads();
//   for (const gamepad of gamepads) {
//     if (gamepad) {
//       // Check the index of the gamepad (0 and 1 for two controllers)
//       if (gamepad.index === 0) {
//         // Right paddle control
//         if (gamepad.axes[1] < -axisThreshold) {
//           rightPaddleUp = true;
//           rightPaddleDown = false;
//         } else if (gamepad.axes[1] > axisThreshold) {
//           rightPaddleUp = false;
//           rightPaddleDown = true;
//         } else {
//           rightPaddleUp = false;
//           rightPaddleDown = false;
//         }
//       } else if (gamepad.index === 1) {
//         // Left paddle control
//         if (gamepad.axes[1] < -axisThreshold) {
//           leftPaddleUp = true;
//           leftPaddleDown = false;
//         } else if (gamepad.axes[1] > axisThreshold) {
//           leftPaddleUp = false;
//           leftPaddleDown = true;
//         } else {
//           leftPaddleUp = false;
//           leftPaddleDown = false;
//         }
//       }
//     }
//   }
// }
