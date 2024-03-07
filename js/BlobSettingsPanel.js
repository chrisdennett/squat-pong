export class BlobSettingsPanel {
  constructor(parent, id) {
    this.id = id;
    this.holder = document.createElement("div");
    this.holder.style.padding = "20px";
    const heading = document.createElement("h2");
    heading.innerHTML = `ID: ${id}`;
    this.holder.appendChild(heading);
    parent.appendChild(this.holder);

    const defaultSettings = {
      [`tolerance`]: {
        type: "slider",
        min: 0,
        max: 255,
        step: 1,
        value: window.localStorage.getItem(`tolerance_${id}`) || 12,
      },
      [`maxBlobRadius`]: {
        type: "slider",
        min: 1,
        max: 300,
        step: 1,
        value: window.localStorage.getItem(`maxBlobRadius_${id}`) || 80,
      },
      [`targetHexColour`]: {
        type: "colour",
        value: window.localStorage.getItem(`targetHexColour_${id}`) || "ff0000",
      },
    };

    this.params = this.initControls(this.holder, defaultSettings);
    this.targetColour = this.getRGBColourObject(this.params.targetHexColour);
  }

  get tolerance() {
    return this.params.tolerance;
  }

  get maxBlobRadius() {
    return this.params.maxBlobRadius;
  }

  getRGBColourObject(hexColour) {
    // convert from hex to rgb(0,0,0);
    const { style } = new Option();
    style.color = hexColour;
    const colourStr = style.color;

    // remove out=er bits
    const rgbStr = colourStr.substring(4, colourStr.length - 1);
    // split into values array
    const [r, g, b] = rgbStr.split(",");

    // return number object
    return { r: parseInt(r), g: parseInt(g), b: parseInt(b) };
  }

  saveToLocalStorage(settingName, value) {}

  initControls(controlsElement, defaultSettings) {
    const params = {};
    const settings = JSON.parse(JSON.stringify(defaultSettings));
    const keys = Object.keys(settings);

    for (let key of keys) {
      if (settings[key].type === "colour") {
        params[key] = defaultSettings[key].value;
      } else {
        params[key] = parseFloat(defaultSettings[key].value);
      }
    }

    for (let key of keys) {
      const c = settings[key];

      // ADD values to params
      if (c.type === "colour") {
        params[key] = defaultSettings[key].value;
      } else {
        params[key] = parseFloat(defaultSettings[key].value);
      }

      // ADD/SETUP THE CONTROL ELEMENTS
      let holdingDiv = document.createElement("div");
      holdingDiv.classList = ["control"];

      let labelElement = document.createElement("label");
      labelElement.innerHTML = key + ":";
      labelElement.classList = ["controlLabel"];

      // arr so can extra elements - e.g. for radio butt options
      let inputElements = [];
      let displayCurrentValue = true;
      let valueElement = document.createElement("span");

      // RANGE SLICER
      if (c.type === "slider") {
        let inputElement = document.createElement("input");
        inputElement.style = "vertical-align: middle;";
        inputElement.type = "range";
        inputElement.min = c.min;
        inputElement.max = c.max;
        inputElement.step = c.step;
        inputElement.value = c.value;

        inputElement.addEventListener("input", (e) => {
          c.value = e.target.value;
          params[key] = parseFloat(c.value);
          valueElement.innerHTML = c.value;
          window.localStorage.setItem(`${key}_${this.id}`, c.value);
        });
        inputElements.push(inputElement);
        //
      }
      // CHECKBOX
      else if (c.type === "checkbox") {
        let inputElement = document.createElement("input");
        inputElement.type = "checkbox";
        inputElement.checked = c.value;
        inputElement.addEventListener("input", (e) => {
          c.value = e.target.checked;
          params[key] = c.value;
          valueElement.innerHTML = c.value;
          window.localStorage.setItem(key, c.value);
        });
        inputElements.push(inputElement);
      }
      // RADIO
      else if (c.type === "radio") {
        displayCurrentValue = false;
        for (let i = 0; i < c.options.length; i++) {
          let inputElement = document.createElement("input");
          inputElement.type = "radio";
          inputElement.id = c.options[i];
          inputElement.value = c.options[i];
          inputElement.name = key;
          inputElement.checked = c.value === c.options[i];
          inputElement.setAttribute("data-index", i);
          inputElements.push(inputElement);
          let label = document.createElement("label");
          label.setAttribute("for", c.options[i]);
          label.innerHTML = c.options[i];
          inputElements.push(label);

          inputElement.addEventListener("input", (e) => {
            c.value = e.target.value;
            params[key] = c.value;
            window.localStorage.setItem(key, c.value);
          });
        }
      }
      // COLOUR
      else if (c.type === "colour") {
        let inputElement = document.createElement("input");
        inputElement.type = "color";
        inputElement.value = c.value;
        inputElement.addEventListener("change", (e) => {
          c.value = e.target.value;
          params[key] = c.value;
          this.targetColour = this.getRGBColourObject(params[key]);
          valueElement.innerHTML = c.value;
          window.localStorage.setItem(`${key}_${this.id}`, c.value);
        });
        inputElements.push(inputElement);
      }

      if (inputElements.length === 0) {
        return;
      }

      holdingDiv.appendChild(labelElement);
      for (let el of inputElements) {
        holdingDiv.appendChild(el);
      }

      if (displayCurrentValue) {
        valueElement.innerHTML = c.value;
        holdingDiv.appendChild(valueElement);
      }

      controlsElement.appendChild(holdingDiv);
    }

    return params;
  }
}

// // select colour
// smallCanvas.addEventListener("click", (e) => {
//   const imageData = smallCtx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
//   const r = imageData[0];
//   const g = imageData[1];
//   const b = imageData[2];
//   const rgbaColor = "rgb(" + r + "," + g + "," + b + ")";
//   console.log("rgbaColor: ", rgbaColor);
//   if (e.shiftKey) {
//     target2Colour = { r, g, b };
//     colour2.style.backgroundColor = `rgb(${r},${g},${b})`;
//   } else {
//     target1Colour = { r, g, b };
//     colour1.style.backgroundColor = `rgb(${r},${g},${b})`;
//   }
// });
