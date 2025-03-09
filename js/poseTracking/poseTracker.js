import { drawVideoToCanvas } from "../utils/drawVideoToCanvas.js";
import { PlayerTracker } from "./playerTracker.js";
// import * as poseDetection from "../../libs/move-net/pose-detection.js";

export class PoseTracker {
  constructor() {
    this.lastVideoTime = -1;

    this.poseLandmarker = undefined;
    this.video = document.getElementById("webcam");
    this.webcamCanvas;
    this.canvas = document.getElementById("poseTrackerCanvas");
    this.canvasCtx = this.canvas.getContext("2d");
    this.videoRunning = false;
    this.logged = false;
    this.segmentationMasks = [];
    this.pose1Canvas = document.getElementById("pose1Canvas");
    this.pose2Canvas = document.getElementById("pose2Canvas");

    this.landmarks = [];
    this.p1Tracker = new PlayerTracker();
    this.p2Tracker = new PlayerTracker();

    this.firstTrackerFound = new PlayerTracker();
    this.secondTrackerFound = new PlayerTracker();

    this.poses = [];

    this.detector = null;

    this.loop();

    this.enableWebcam();
    this.setup();
  }

  async setup() {
    this.detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      {
        modelType: poseDetection.movenet.modelType.MULTIPOSE_LIGHTNING,
        enableSmoothing: true,
        // minPoseScore: 0.5,
        multiPoseMaxDimension: 256, // Must be a multiple of 32 and defaults to 256. The recommended range is [128, 512]
        modelUrl: "./libs/move-net/model.json", // Add this line
      }
    );
  }

  async getPoses() {
    if (this.detector && this.videoRunning) {
      this.poses = await this.detector.estimatePoses(this.video, {
        maxPoses: 2,
        // flipHorizontal: true,
      });

      // TODO: ensure player 1 landmarks are on the left and p2 on the right
      let p1Landmarks = [];
      let p2Landmarks = [];
      let p1Box = {};
      let p2Box = {};
      const firstPoseFound = this.poses.length > 0;
      const secondPoseFound = this.poses.length > 1;

      // console.log("this.poses.length: ", this.poses.length);

      // set first pose to p1 or p2 depending on side found
      if (firstPoseFound) {
        const noseX = this.poses[0].keypoints[0].x;
        // if on left set it to p1
        if (noseX < this.width / 2) {
          p2Landmarks = this.poses[0].keypoints;
          p2Box = this.poses[0].box;
        } else {
          p1Landmarks = this.poses[0].keypoints;
          p1Box = this.poses[0].box;
        }
      }

      // set second pose to p1 or p2 depending on side found
      if (secondPoseFound) {
        const noseX = this.poses[1].keypoints[0].x;
        // if on left set it to p1
        if (noseX < this.width / 2) {
          p2Landmarks = this.poses[1].keypoints;
          p2Box = this.poses[1].box;
        } else {
          p1Landmarks = this.poses[1].keypoints;
          p1Box = this.poses[1].box;
        }
      }

      if (this.poses.length > 0) {
        this.firstTrackerFound.setLandmarks(
          this.poses[0].keypoints,
          this.poses[0].box
        );
      }
      if (this.poses.length > 1) {
        this.secondTrackerFound.setLandmarks([], {});
      } else {
        this.secondTrackerFound.setLandmarks([], {});
      }

      this.p1Tracker.setLandmarks(p1Landmarks, p1Box);
      this.p2Tracker.setLandmarks(p2Landmarks, p2Box);
    }
    requestAnimationFrame(this.getPoses.bind(this));
  }

  // Enable the live webcam view and start detection.
  enableWebcam() {
    // Activate the webcam stream.
    navigator.mediaDevices
      .getUserMedia({
        video: true,
      })
      .then((stream) => {
        this.video.srcObject = stream;
        this.video.addEventListener("loadeddata", () => {
          this.videoRunning = true;
          this.getPoses();
        });
      });
  }

  loop() {
    this.drawPlayers();

    window.requestAnimationFrame(this.loop.bind(this));
  }

  drawPlayers() {
    if (this.width > 0) {
      this.webcamCanvas = drawVideoToCanvas(this.video);

      const w = this.width / 2;
      const h = this.height;

      this.canvas.width = this.width;
      this.pose1Canvas.width = this.pose2Canvas.width = w;
      this.pose1Canvas.height =
        this.pose2Canvas.height =
        this.canvas.height =
          h;

      this.drawSkeletons(this.webcamCanvas.getContext("2d"));
      const ctx1 = this.pose1Canvas.getContext("2d");
      const ctx2 = this.pose2Canvas.getContext("2d");

      ctx1.drawImage(this.webcamCanvas, w, 0, w, h, 0, 0, w, h);
      ctx1.drawImage(this.canvas, w, 0, w, h, 0, 0, w, h);

      ctx2.drawImage(this.webcamCanvas, 0, 0, w, h, 0, 0, w, h);
      ctx2.drawImage(this.canvas, 0, 0, w, h, 0, 0, w, h);

      this.p1Tracker.drawMinMax(ctx1, this.pose1Canvas.width);
      this.p2Tracker.drawMinMax(ctx2, this.pose2Canvas.width);
    }
  }

  get width() {
    return this.video.videoWidth;
  }

  get height() {
    return this.video.videoHeight;
  }

  getVideo() {
    return this.video;
  }

  drawSkeletons(ctx) {
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 10;
    let pose, partA, partB;

    // Draw all the tracked landmark points
    for (let i = 0; i < this.poses.length; i++) {
      pose = this.poses[i];
      // shoulder to wrist
      for (let j = 5; j < 9; j++) {
        if (
          pose.keypoints[j].score > 0.1 &&
          pose.keypoints[j + 2].score > 0.1
        ) {
          partA = pose.keypoints[j];
          partB = pose.keypoints[j + 2];
          this.drawLine(ctx, partA, partB);
        }
      }
      // shoulder to shoulder
      partA = pose.keypoints[5];
      partB = pose.keypoints[6];
      if (partA.score > 0.1 && partB.score > 0.1) {
        this.drawLine(ctx, partA, partB);
      }
      // hip to hip
      partA = pose.keypoints[11];
      partB = pose.keypoints[12];
      if (partA.score > 0.1 && partB.score > 0.1) {
        this.drawLine(ctx, partA, partB);
      }
      // shoulders to hips
      partA = pose.keypoints[5];
      partB = pose.keypoints[11];
      if (partA.score > 0.1 && partB.score > 0.1) {
        this.drawLine(ctx, partA, partB);
      }
      partA = pose.keypoints[6];
      partB = pose.keypoints[12];
      if (partA.score > 0.1 && partB.score > 0.1) {
        this.drawLine(ctx, partA, partB);
      }
      // hip to foot
      for (let j = 11; j < 15; j++) {
        if (
          pose.keypoints[j].score > 0.1 &&
          pose.keypoints[j + 2].score > 0.1
        ) {
          partA = pose.keypoints[j];
          partB = pose.keypoints[j + 2];
          this.drawLine(ctx, partA, partB);
        }
      }

      // draw face
      this.drawCircle(ctx, pose.keypoints[0]); // nose
      this.drawCircle(ctx, pose.keypoints[1]); // left eye
      this.drawCircle(ctx, pose.keypoints[2]); // right eye
      // this.drawCircle(ctx, pose.keypoints[3]); // left ear
      // this.drawCircle(ctx, pose.keypoints[4]); // right ear
    }
  }

  drawLine(ctx, from, to) {
    this.drawCircle(ctx, from);
    this.drawCircle(ctx, to);

    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  drawCircle(ctx, pt) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, 2 * Math.PI);
    ctx.stroke();
  }
}

/* Points (view on left of screen = left part - when mirrored)
    0 nose
    1 left eye
    2 right eye
    3 left ear
    4 right ear
    5 left shoulder
    6 right shoulder
    7 left elbow
    8 right elbow
    9 left wrist
    10 right wrist
    11 left hip
    12 right hip
    13 left kneee
    14 right knee
    15 left foot
    16 right foot
  */
