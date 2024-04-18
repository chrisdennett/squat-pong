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
    this.pose1Canvas = document.getElementById("pose1Canvas");
    this.pose2Canvas = document.getElementById("pose2Canvas");

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

    this.loop();
  }

  loop(timeStamp) {
    this.detectLandmarks(timeStamp);
    this.drawPlayers();

    window.requestAnimationFrame(this.loop.bind(this));
  }

  drawPlayers() {
    if (this.width > 0) {
      const w = this.width / 2;
      const h = this.height;

      this.canvas.width = this.width;
      this.pose1Canvas.width = this.pose2Canvas.width = w;
      this.pose1Canvas.height =
        this.pose2Canvas.height =
        this.canvas.height =
          h;

      this.drawLandmarks();
      const ctx1 = this.pose1Canvas.getContext("2d");
      const ctx2 = this.pose2Canvas.getContext("2d");

      ctx1.drawImage(this.video, w, 0, w, h, 0, 0, w, h);
      ctx1.drawImage(this.canvas, w, 0, w, h, 0, 0, w, h);

      ctx2.drawImage(this.video, 0, 0, w, h, 0, 0, w, h);
      ctx2.drawImage(this.canvas, 0, 0, w, h, 0, 0, w, h);

      this.p1Tracker.drawMinMax(
        ctx1,
        this.pose1Canvas.width,
        this.pose1Canvas.height,
        false
      );
      this.p2Tracker.drawMinMax(
        ctx2,
        this.pose2Canvas.width,
        this.pose2Canvas.height,
        true
      );
    }
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

  detectLandmarks(timeStamp) {
    if (!this.poseLandmarker || !this.videoRunning) return;

    if (this.lastVideoTime !== this.video.currentTime) {
      this.lastVideoTime = this.video.currentTime;
      this.poseLandmarker.detectForVideo(this.video, timeStamp, (result) => {
        this.landmarks = result.landmarks;

        // if (!this.logged && result.segmentationMasks.length > 0) {
        //   this.logged = true;
        //   console.log("result: ", result);
        // }
        // this.segmentationMasks = result.segmentationMasks;

        let p1Landmarks = [];
        let p2Landmarks = [];

        // order find poses might not be same as player 1 then player 2
        const firstPoseFound = this.landmarks.length > 0;
        const secondPoseFound = this.landmarks.length > 1;

        // set first pose to p1 or p2 depending on side found
        if (firstPoseFound) {
          const noseX = this.landmarks[0][0].x * this.width;
          // if on left set it to p1
          if (noseX < this.width / 2) {
            p2Landmarks = this.landmarks[0];
          } else {
            p1Landmarks = this.landmarks[0];
          }
        }

        // set second pose to p1 or p2 depending on side found
        if (secondPoseFound) {
          const noseX = this.landmarks[1][0].x * this.width;
          // if on left set it to p1
          if (noseX < this.width / 2) {
            p2Landmarks = this.landmarks[1];
          } else {
            p1Landmarks = this.landmarks[1];
          }
        }

        this.p1Tracker.setLandmarks(p1Landmarks);
        this.p2Tracker.setLandmarks(p2Landmarks);
      });
    }
  }

  getVideo() {
    return this.video;
  }

  drawLandmarks() {
    // const ctx = this.canvas.getContext("2d");
    // ctx.globalAlpha = 0.4;
    // ctx.drawImage(this.video, 0, 0);
    // ctx.globalAlpha = 1;

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
