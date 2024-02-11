const canvas = document.querySelector("#canvas");
const webcamVideo = document.querySelector("#webcamVideo");

canvas.width = 800;
canvas.height = 600;

function connectWebcam() {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({
        video: { width: 800, height: 600 },
      })
      .then(function (stream) {
        webcamVideo.srcObject = stream;
      })
      .catch(function (error) {
        console.log("video error: ", error);
      });
  }
}

connectWebcam();
