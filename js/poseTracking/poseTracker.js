import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0";

export class PoseTracker {
  constructor() {
    this.lastVideoTime = -1;

    this.poseLandmarker = undefined;
    this.runningMode = "VIDEO";
    this.videoHeight = "360px";
    this.videoWidth = "480px";
    this.video = document.getElementById("webcam");
    this.canvasElement = document.getElementById("output_canvas");
    this.canvasCtx = this.canvasElement.getContext("2d");
    this.drawingUtils = new DrawingUtils(this.canvasCtx);
    this.videoRunning = false;

    // Before we can use PoseLandmarker class we must wait for it to finish
    // loading. Machine Learning models can be large and take a moment to
    // get everything needed to run.
    this.createPoseLandmarker((pl) => {
      this.poseLandmarker = pl;
      this.enableCam();
    });

    this.landmarks = [];
  }

  createPoseLandmarker = async (callback) => {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
        delegate: "GPU",
      },
      runningMode: this.runningMode,
      numPoses: 2,
    });

    callback(poseLandmarker);
  };

  // Enable the live webcam view and start detection.
  enableCam() {
    if (!this.poseLandmarker) {
      console.log("Wait! poseLandmaker not loaded yet.");
      return;
    }

    // Activate the webcam stream.
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.addEventListener("loadeddata", () => {
          this.videoRunning = true;
        });
      });
  }

  detectLandmarks() {
    if (!this.poseLandmarker || !this.videoRunning) return;

    this.video.style.height = this.videoHeight;
    this.video.style.width = this.videoWidth;

    let startTimeMs = performance.now();

    if (this.lastVideoTime !== this.video.currentTime) {
      this.lastVideoTime = this.video.currentTime;
      this.poseLandmarker.detectForVideo(this.video, startTimeMs, (result) => {
        this.landmarks = result.landmarks;
      });
    }
  }

  drawLandmarks() {
    this.canvasElement.style.height = this.videoHeight;
    this.canvasElement.style.width = this.videoWidth;

    this.canvasCtx.save();
    this.canvasCtx.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height
    );

    for (const landmark of this.landmarks) {
      this.drawingUtils.drawLandmarks(landmark, {
        radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
      });
      this.drawingUtils.drawConnectors(
        landmark,
        PoseLandmarker.POSE_CONNECTIONS
      );
    }

    this.canvasCtx.restore();
  }
}
