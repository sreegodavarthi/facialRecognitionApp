const video = document.querySelector("video");

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models")
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => (video.srcObject = stream),
    err => console.log(err)
  );
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.querySelector(".video-container").append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    console.log(detections);
    const resizeDetections = faceapi.resizeResults(detections, displaySize);
    if (resizeDetections.length > 0) {
      if (
        resizeDetections[0].expressions.happy > 0.9 &&
        resizeDetections[0].expressions.happy < 1.0
      ) {
        document.querySelector(".mood-msg").innerText = "Nice..Keep Smiling!!!";
      } else if (
        resizeDetections[0].expressions.neutral > 0.9 &&
        resizeDetections[0].expressions.neutral < 1.0
      ) {
        document.querySelector(".mood-msg").innerText = "Smile please!!!";
      } else if (
        resizeDetections[0].expressions.angry > 0.9 &&
        resizeDetections[0].expressions.angry < 1.0
      ) {
        document.querySelector(".mood-msg").innerText =
          "Why so angry??? Chill!!!";
      } else if (
        resizeDetections[0].expressions.surprised > 0.9 &&
        resizeDetections[0].expressions.surprised < 1.0
      ) {
        document.querySelector(".mood-msg").innerText = "Surprised???";
      }
    }
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizeDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizeDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizeDetections);
  }, 100);
});
