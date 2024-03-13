import { SettingsPanel } from "./settingsPanels/SettingsPanel.js";
import { hexToHSL } from "./colourUtils.js";

export class BlobTracker extends SettingsPanel {
  constructor(parent, id, globalSettings) {
    super(parent, id);

    const defaultSettings = {
      tolerance: {
        type: "slider",
        min: 0,
        max: 50,
        step: 1,
        value: window.localStorage.getItem(`tolerance_${id}`) || 12,
      },
      maxBlobRadius: {
        type: "slider",
        min: 1,
        max: 100,
        step: 1,
        value: window.localStorage.getItem(`maxBlobRadius_${id}`) || 80,
      },
      targetHexColour: {
        type: "colour",
        callback: (col) => (this.targetColour = hexToHSL(col)),
        value: window.localStorage.getItem(`targetHexColour_${id}`) || "ff0000",
      },
    };

    this.params = this.initControls(this.holder, defaultSettings);
    this.targetColour = hexToHSL(this.params.targetHexColour);
    this.blobs = [];
    this.filteredBlobs = [];
    this.globalSettings = globalSettings;
    // this.targetColour = this.getRGBColourObject(this.params.targetHexColour);
  }

  setFilteredBlobArray() {
    this.filteredBlobs = [];
    for (let b of this.blobs) {
      if (
        b.width > this.globalSettings.minBlobWidth &&
        b.height > this.globalSettings.minBlobHeight
      ) {
        this.filteredBlobs.push(b);
      }
    }
  }

  displayBlobs(ctx) {
    for (let b of this.filteredBlobs) {
      b.display(ctx, this.params.targetHexColour);
    }
  }

  clearBlobs() {
    for (let b of this.blobs) {
      b.clear();
    }
  }

  get tolerance() {
    return this.params.tolerance;
  }

  get maxBlobRadius() {
    return this.params.maxBlobRadius;
  }
}
