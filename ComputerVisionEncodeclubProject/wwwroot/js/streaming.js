
// works only in firefox
const preview = document.getElementById("preview");
const recording = document.getElementById("recording");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const downloadButton = document.getElementById("downloadButton");

const recordingTimeMS = 10000;

function wait(delayInMS) {
    return new Promise((resolve) => setTimeout(resolve, delayInMS));
}

function startRecording(stream, lengthInMS) {
    const recorder = new MediaRecorder(stream);
    const data = [];

    recorder.ondataavailable = (event) => data.push(event.data);
    recorder.start();
    
    const stopped = new Promise((resolve, reject) => {
        recorder.onstop = resolve;
        recorder.onerror = (event) => reject(event.name);
    });

    const recorded = wait(lengthInMS).then(
        () => recorder.state == "recording" && recorder.stop()
    );

    return Promise.all([stopped, recorded]).then(() => data);
}

function stop(stream) {
    stream.getTracks().forEach((track) => track.stop());
}

startButton.addEventListener(
    "click",
    function () {
        navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: false
            })
            .then((stream) => {
                preview.srcObject = stream;
                downloadButton.href = stream;
                preview.captureStream =
                    preview.captureStream || preview.mozCaptureStream;
                return new Promise((resolve) => (preview.onplaying = resolve));
            })
            .then(() => startRecording(preview.captureStream(), recordingTimeMS))
            .then((recordedChunks) => {
                let recordedBlob = new Blob(recordedChunks, { type: "video/webm" });
                recording.src = URL.createObjectURL(recordedBlob);
                downloadButton.href = recording.src;
                downloadButton.download = "RecordedVideo.webm";
            })
            .catch("error");
    },
    false
);

stopButton.addEventListener(
    "click",
    function () {
        stop(preview.srcObject);
    },
    false
);
