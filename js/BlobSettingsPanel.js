import { SettingsPanel } from "./SettingsPanel.js";

export class BlobSettingsPanel extends SettingsPanel {
  constructor(parent, id) {
    super(parent, id);

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
        callback: (col) => (this.targetColour = this.getRGBColourObject(col)),
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
}
