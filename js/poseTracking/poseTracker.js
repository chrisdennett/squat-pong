// https://josephwritescode.substack.com/p/realtime-web-motion-detection-with-mediapipe
// https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/index#models

import * as Vision from "../../libs/@mediapipe/tasks-vision/vision_bundle.mjs";
const { PoseLandmarker, FilesetResolver, DrawingUtils } = Vision;

export class PoseTracker {
  constructor() {
    this.lastVideoTime = -1;

    this.poseLandmarker = undefined;
    this.runningMode = "VIDEO";
    this.videoHeight = 360;
    this.videoWidth = 480;
    this.video = document.getElementById("webcam");
    this.canvasElement = document.getElementById("output_canvas");
    this.canvasCtx = this.canvasElement.getContext("2d");
    this.drawingUtils = new DrawingUtils(this.canvasCtx);
    this.videoRunning = false;

    this.video.style.height = this.videoHeight + "px";
    this.video.style.width = this.videoWidth + "px";

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

    let startTimeMs = performance.now();

    if (this.lastVideoTime !== this.video.currentTime) {
      this.lastVideoTime = this.video.currentTime;
      this.poseLandmarker.detectForVideo(this.video, startTimeMs, (result) => {
        this.landmarks = result.landmarks;
      });
    }
  }

  drawLandmarks() {
    this.canvasElement.height = this.videoHeight;
    this.canvasElement.width = this.videoWidth;
    let isLogged = false;

    for (const landmark of this.landmarks) {
      //   const radius = DrawingUtils.lerp(landmark[0].z, -0.15, 0.1, 5, 1);
      const radius = DrawingUtils.lerp(landmark[0].z, -0.15, 0.1, 5, 1);

      if (!isLogged) {
        isLogged = true;
        console.log("radius: ", radius);
      }

      this.drawingUtils.drawLandmarks(landmark, { radius });

      this.drawingUtils.drawConnectors(
        landmark,
        PoseLandmarker.POSE_CONNECTIONS
      );
    }
  }
}
