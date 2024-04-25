"use strict";

let vid = document.getElementById('liveStream');

var canvas = document.createElement("canvas");
function PlayVideo() {
    navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((localMediaStream) => {            
            vid.srcObject = localMediaStream;
            
            vid.play();
            
            const recorder = new MediaRecorder(localMediaStream);


            recorder.ondataavailable = event => {               

                canvas.width = vid.videoWidth;
                canvas.height = vid.videoHeight;
                canvas
                    .getContext("2d")
                    .drawImage(vid, 0, 0, vid.videoWidth, vid.videoHeight);

                var imgString = canvas.toDataURL();
                LivestreamImageProcess(imgString);
            };

            recorder.start(2000);
            
        })
        .catch((error) => {
            console.log("Rejected!", error);
        });
}

function PauseVideo() {
    vid.pause();
}


function LivestreamImageProcess(imgData) {    

    var request = new XMLHttpRequest();
   
    if (request != null) {
        var url = "/Home/LiveStream";
        request.open("POST", url, false);
        request.setRequestHeader("Content-Type", "application/json");
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                var response = JSON.parse(request.responseText);
               
                document.getElementById("screenShot").src = response.imgData;
            }
        };
        request.send(JSON.stringify(imgData));
    }
}