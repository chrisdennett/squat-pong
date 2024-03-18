import { SettingsPanel } from "./SettingsPanel.js";
import { hexToHSL } from "../../utils/colourUtils.js";

/*
Combined Controls and blob store
*/
export class BlobTracker extends SettingsPanel {
  constructor(parent, id, globalSettings) {
    super(parent, id);

    const defaultSettings = {
      targetHexColour: {
        type: "colour",
        callback: (col) => (this.targetColour = hexToHSL(col)),
        value: window.localStorage.getItem(`targetHexColour_${id}`) || "ff0000",
      },
    };

    this.params = this.initControls(this.holder, defaultSettings);
    this.targetColour = hexToHSL(this.params.targetHexColour);
    this.blobs = [];
    this.globalSettings = globalSettings;
    this.p1Blobs = [];
    this.p2Blobs = [];

    // this.targetColour = this.getRGBColourObject(this.params.targetHexColour);
  }

  filterAndSeparateBlobTypes() {
    this.p1Blobs = [];
    this.p2Blobs = [];
    for (let b of this.blobs) {
      if (
        b.width > this.globalSettings.minBlobWidth &&
        b.height > this.globalSettings.minBlobHeight
      ) {
        if (b.type === "p1") {
          this.p1Blobs.push(b);
        } else {
          this.p2Blobs.push(b);
        }
      }
    }
  }

  displayBlobs(ctx) {
    for (let b of this.p1Blobs) {
      b.display(ctx, this.params.targetHexColour);
    }
  }

  clearBlobs() {
    for (let b of this.blobs) {
      b.clear();
    }
  }
}
