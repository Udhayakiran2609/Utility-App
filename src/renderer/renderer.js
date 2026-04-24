// const { ipcRenderer } = require('electron')
// const path = require('path')

// document.addEventListener("keydown", (event)=>{
//     if(event.ctrlKey && event.key == "C"){
//       console.log("Ctrl + C is pressed")
//        ipcRenderer.send("text-changed",()=>{
//         console.log("Im in")
//        })
//     }
// })
// const videoSelectBtn = document.getElementById('videoSelectBtn');
// videoSelectBtn.onclick = getVideoSources;

// const { desktopCapturer, remote } = require('electron');
// const { Menu } = remote;

// // Get the available video sources
// async function getVideoSources() {
//   const inputSources = await desktopCapturer.getSources({
//     types: ['window', 'screen']
//   });
// }


// let closewindow = document.getElementById("close-window")

// const videoElement = document.getElementById('videoElement');

// $("#startBtn").on('click', () => {
//   ipcRenderer.send('start-recording');
//   videoElement.style.display = 'block';
// });

// $("#stopBtn").on('click', () => {
//   ipcRenderer.send('stop-recording');
// });

// ipcRenderer.on('video-source', (event, source) => {
//   videoElement.srcObject = source;
// });