// local files setup using npm then copying the files into the right place.
// npm i @mediapipe/tasks-vision
// https://josephwritescode.substack.com/p/realtime-web-motion-detection-with-mediapipe
// https://developers.google.com/mediapipe/solutions/vision/pose_landmarker/index#models
import * as Vision from "../../libs/@mediapipe/tasks-vision/vision_bundle.mjs";
import { PlayerTracker } from "./playerTracker.js";
const { PoseLandmarker, FilesetResolver, DrawingUtils } = Vision;

export class PoseTracker {
  constructor() {
    this.lastVideoTime = -1;

    this.poseLandmarker = undefined;
    this.video = document.getElementById("webcam");
    this.canvas = document.getElementById("poseTrackerCanvas");
    this.canvasCtx = this.canvas.getContext("2d");
    this.drawingUtils = new DrawingUtils(this.canvasCtx);
    this.videoRunning = false;
    this.logged = false;
    this.segmentationMasks = [];

    // Before we can use PoseLandmarker class we must wait for it to finish
    // loading. Machine Learning models can be large and take a moment to
    // get everything needed to run.
    this.createPoseLandmarker((pl) => {
      this.poseLandmarker = pl;
      this.enableWebcam();
    });

    this.landmarks = [];
    this.p1Tracker = new PlayerTracker();
    this.p2Tracker = new PlayerTracker();
  }

  drawPlayers(canvas) {
    this.drawLandmarks();

    // canvas.width = this.width;
    // canvas.height = this.height;
    // const ctx = canvas.getContext("2d");
    // ctx.drawImage(this.video, 0, 0);

    // this.p1Tracker.draw(ctx, canvas.width, canvas.height, false);
    // this.p2Tracker.draw(ctx, canvas.width, canvas.height, true);
  }

  get width() {
    return this.video.videoWidth;
  }

  get height() {
    return this.video.videoHeight;
  }

  createPoseLandmarker = async (callback) => {
    const vision = await FilesetResolver.forVisionTasks(
      "../../libs/@mediapipe/tasks-vision/wasm"
    );

    const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "../../libs/@mediapipe/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 2,
      minPoseDetectionConfidence: 0.8,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputSegmentationMasks: false,
    });

    callback(poseLandmarker);
  };

  // Enable the live webcam view and start detection.
  enableWebcam() {
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

        // if (!this.logged && result.segmentationMasks.length > 0) {
        //   this.logged = true;
        //   console.log("result: ", result);
        // }
        // this.segmentationMasks = result.segmentationMasks;

        if (this.landmarks.length > 0) {
          this.p1Tracker.setLandmarks(this.landmarks[0]);
        } else {
          this.p1Tracker.setLandmarks([]);
        }

        if (this.landmarks.length > 1) {
          this.p2Tracker.setLandmarks(this.landmarks[1]);
        } else {
          this.p2Tracker.setLandmarks([]);
        }
      });
    }
  }

  getVideo() {
    return this.video;
  }

  drawLandmarks() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const ctx = this.canvas.getContext("2d");
    ctx.globalAlpha = 0.4;
    ctx.drawImage(this.video, 0, 0);
    ctx.globalAlpha = 1;

    // if (this.segmentationMasks.length > 0) {
    //   const offscreenCanvas = this.segmentationMasks[0].canvas;

    //   const bitmapOne =
    //     this.segmentationMasks[0].canvas.transferToImageBitmap();

    //   ctx.drawImage(bitmapOne, 0, 0);
    // }

    for (const landmark of this.landmarks) {
      const radius = DrawingUtils.lerp(landmark[0].z, -0.15, 0.1, 5, 1);
      // const radius = 10;
      this.drawingUtils.drawLandmarks(landmark, { radius });

      this.drawingUtils.drawConnectors(
        landmark,
        PoseLandmarker.POSE_CONNECTIONS
      );
    }
  }
}
