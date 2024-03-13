import { SettingsPanel } from "./SettingsPanel.js";

export class GlobalSettingsPanel extends SettingsPanel {
  constructor(parent, id) {
    super(parent, id);

    const defaultSettings = {
      blobPairGap: {
        type: "slider",
        min: 0,
        max: 255,
        step: 1,
        value: window.localStorage.getItem(`blobPairGap_${id}`) || 12,
      },
      minBlobWidth: {
        type: "slider",
        min: 0,
        max: 50,
        step: 1,
        value: window.localStorage.getItem(`minBlobWidth_${id}`) || 12,
      },
      minBlobHeight: {
        type: "slider",
        min: 0,
        max: 50,
        step: 1,
        value: window.localStorage.getItem(`minBlobHeight_${id}`) || 12,
      },
    };

    this.params = this.initControls(this.holder, defaultSettings);
  }

  get blobPairGap() {
    return this.params.blobPairGap;
  }

  get minBlobWidth() {
    return this.params.minBlobWidth;
  }

  get minBlobHeight() {
    return this.params.minBlobHeight;
  }
}
