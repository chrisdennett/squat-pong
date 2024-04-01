// local files setup using npm then copying the files into the right place.
// npm i @mediapipe/tasks-vision
// https://josephwritescode.substack.com/p/realtime-web-motion-detection-with-mediapipe
// https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/index#models
import * as Vision from "../../libs/@mediapipe/tasks-vision/vision_bundle.mjs";
const { PoseLandmarker, FilesetResolver, DrawingUtils } = Vision;

export class PoseTracker {
  constructor() {
    this.lastVideoTime = -1;

    this.poseLandmarker = undefined;
    this.runningMode = "VIDEO";
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
    this.p1 = [];
    this.p2 = [];
  }

  get nose1Pos() {
    let pos = { x: 0, y: 0, z: 0 };
    if (this.p1 && this.p1.length > 0) {
      pos = this.p1[0];
    }
    return pos;
  }

  get nose2Pos() {
    let pos = { x: 0, y: 0, z: 0 };
    if (this.p2 && this.p2.length > 0) {
      pos = this.p2[0];
    }
    return pos;
  }

  get width() {
    return this.video.videoWidth;
  }

  get height() {
    return this.video.videoHeight;
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
        if (this.landmarks.length > 0) {
          this.p1 = this.landmarks[0];
        }

        if (this.landmarks.length > 1) {
          this.p2 = this.landmarks[1];
        }
      });
    }
  }

  getVideo() {
    return this.video;
  }

  drawLandmarks() {
    this.canvasElement.height = this.videoHeight;
    this.canvasElement.width = this.videoWidth;

    for (const landmark of this.landmarks) {
      //   const radius = DrawingUtils.lerp(landmark[0].z, -0.15, 0.1, 5, 1);
      const radius = DrawingUtils.lerp(landmark[0].z, -0.15, 0.1, 5, 1);
      this.drawingUtils.drawLandmarks(landmark, { radius });

      this.drawingUtils.drawConnectors(
        landmark,
        PoseLandmarker.POSE_CONNECTIONS
      );
    }
  }
}
