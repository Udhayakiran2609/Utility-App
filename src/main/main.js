const { app, BrowserWindow,BrowserView, Menu, globalShortcut, ipcMain, Tray, shell,clipboard,desktopCapturer, webContents, ipcRenderer, Notification, nativeImage, } = require('electron')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { copySync } = require('fs-extra')
const { dialog } = require('electron')
const {remote} = require('electron')
const { initializeApp } = require("firebase/app");
const { getAnalytics } = require("firebase/analytics");
const { getDatabase, ref, set, onValue } = require("firebase/database");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,signInWithCustomToken } = require("firebase/auth");
// import * as JimpObj from 'jimp';
// const Jimp = JimpObj.default;
// import "regenerator-runtime/runtime"; 
// import 'jimp/browser/lib/jimp'
let storedClipboardValue = ""
// const clipboard = require('electron-clipboard-extended');
// const Store = require('electron-store');
// const builder = require("electron-builder")
// const Platform = builder.Platform
// const fs = require('fs')
// const path = require('path');
// const { cli } = require('webpack-dev-server');
// const colors = require('colors')
// console.log(colors.rainbow("Hello world"))
Menu.setApplicationMenu(false)  
let win
let tray = null
const shouldQuit = app.requestSingleInstanceLock();

if (!shouldQuit) {
  app.quit();
} 
else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  }
  )
}
// process.env.NODE_ENV ='development'
// const isDev = process.env.NODE_ENV !== 'production' ? true : false
const createWindow = () => {
  win = new BrowserWindow({
    width:700,
    height:500,
    maxWidth: 700,
    maxHeight: 500,
    minWidth: 700,
    minHeight: 500,
    show:true,
    frame:false,
    // titleBarStyle:'hidden',
    icon:"./build/assests/isc.ico",
    webPreferences: {
      nodeIntegration:true,
      contextIsolation: false

    }
  })


  // if(isDev){
  //   win.webContents.openDevTools()
  // }

  win.loadFile('./src/renderer/index.html')
  win.webContents.openDevTools()
  

  win.on('closed',()=>{
    win = null
  })

}


// const createChildWindow = ()=>{
//   child = new BrowserWindow({
//     width:900,
//     height:600,
//     maxWidth: 900,
//     maxHeight: 600,
//     minWidth: 900,
//     minHeight: 600,
//     frame:false,
//     icon:"./assests/apple.png",
//     webPreferences:{
//       nodeIntegration: true,
//       contextIsolation: false
//     },
//     modal:true,
//     parent:win
//   })
//   child.loadFile("./src/main/child.html")

//     child.on('closed',()=>{
//     child = null
//   })
// }


app.whenReady().then(() => {
  createWindow()
  const contents = win.webContents
  globalShortcut.register('CmdorCtrl+R',()=>{
    win.reload()
  })
  globalShortcut.register('CmdorCtrl+Shift+I',()=>{
    win.toggleDevTools()
  })
 
  
// clipboard

setInterval(()=>{
  var clipbaordVal = clipboard.readText('clipboard')
  if(clipbaordVal !== storedClipboardValue){
    storedClipboardValue = clipbaordVal
    win.webContents.send("copied", clipbaordVal)
  }

},500)
 
  
  // tray
  let icon = nativeImage.createFromPath(path.join(__dirname ,"../","../","assests","20tray.png"))
  tray = new Tray(icon)
  tray.on("click", ()=>{
    if(win.isVisible()==true){
      win.hide()
    }else{
      win.show()
    }
  })
tray.setToolTip("Iscify")
  const contextMenu = Menu.buildFromTemplate([
    {
      label:"Stop Recording",
      click: ()=>{
        win.webContents.send("stopRecording")
        win.show()
        
      }
    },
    {
      label:"Exit",
      click: ()=>{
        win.close()
      }
    }
  ])
  tray.setContextMenu(contextMenu)
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
if (process.platform !== 'darwin') {
  app.quit()
}
})

 
// ipcMain.on("forEditForm", (e)=>{
//   win.hide()
//   createChildWindow()
//   // child.webContents.openDevTools()
  
//  })

// Resize Img
// ipcMain.on('resize:img', (e, options) => {
//   win.webContents.send("download:done")
// });

// async function resizeImage  ({ imgPath, width, height, dest }) {
//   try {
//     console.log(imgPath, width, height, dest);
//     const newPath = await resizeImg(fs.readFileSync(imgPath), {
//       width: +width,
//       height: +height,
//     });
//     win.webContents.send("imagepath", newPath)
//     // const filename = path.basename(imgPath);
//     // if (!fs.existsSync(dest)) {
//     //   fs.mkdirSync(dest);
//     // }
//     // fs.writeFileSync(path.join(dest, filename), newPath);
//     // // win.webContents.send('image:done');
//     // shell.openPath(dest);
//   } catch (err) {
//     console.log(err);
//   }
// }

// Desktop capture
ipcMain.on("screenRecord", ()=>{
  console.log("StartBtn On")
  // win.webContents.send('SET_SOURCE')
  desktopCapturer.getSources({ types: ['window', 'screen', 'audio'] }).then(async sources => {
    console.log(sources)
    for (var i=0;i<sources.length;i++) {
      // win.webContents.send('setSource', sources[e.sender.id].id)
      console.log(sources[i])
      console.log(sources[i].id)
      if (sources[i].name === "Entire screen") {
        console.log(sources[i].id)
        console.log("sourcenamein")
        win.webContents.send('SET_SOURCE', sources[i].id)
        return
      }
    }
  })
})

ipcMain.on('stop-recording', ()=>{
  stopRecording()
})


// Clipboard


  ipcMain.on("input-text", (e, inputValue)=>{ 
    async function saveFile(inputValue) {
      try {
        const result = await dialog.showSaveDialog({
          title: 'Save File',
          defaultPath: `${inputValue.filename}.txt`, // default filename
          filters: [
            { name: 'Text Files', extensions: ['txt'] }, 
          ],
        });
    
        if (!result.canceled && result.filePath) {
          // Write content to the file
          const content = inputValue.inputText
          fs.writeFile(result.filePath, content, err => {
            if (err) {
              console.error('Error saving file:', err);
            } else {
              console.log('File saved successfully!');
            }
          });
        }
      } catch (err) {
        console.error('Error showing save dialog:', err);
      }
    }
    saveFile(inputValue)
  })


// signin and login

function initializing(){
  const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    databaseURL: process.env.DATABASE_URL,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID
  };
  console.log(firebaseConfig)
  const app =initializeApp(firebaseConfig);

  console.log(app)
  const auth = getAuth()
  return auth
}

ipcMain.on("register-auth",(e,email,password)=>{
  console.log(email, password)
  const auth =initializing()
  createUserWithEmailAndPassword(auth,email,password)
  .then((credentials) => {
    // Signed up 
    console.log(credentials)
    const user = credentials.user;
    // console.log(user)
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage)
    console.log(errorCode)
    // ..
  });
})

ipcMain.on("login-auth",(e,email,password)=>{
  const auth =initializing()
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed in 
    const user = userCredential.user;
    // console.log(user)
    mainWindow.webContents.send("login")
    const liveuser=auth.currentUser
    console.log(liveuser)
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode)
  });
})

  



 
ipcMain.on("windowClose", ()=>{
  win.close()
 
})

ipcMain.on("miniClose", ()=>{
  win.minimize()
})

// Notification
ipcMain.on("saveimage", ()=>{
  const NOTIFICATION_TITLE = 'Save image'
const NOTIFICATION_BODY = 'Image successfully saved'
function showNotification () {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}
showNotification(NOTIFICATION_TITLE, NOTIFICATION_BODY)
})
// ipcMain.on("downloadimage", ()=>{
//   const NOTIFICATION_TITLE = 'Download Image'
// const NOTIFICATION_BODY = 'Image successfully downloaded'
// function showNotification () {
//   new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
// }
// showNotification(NOTIFICATION_TITLE, NOTIFICATION_BODY)
// })

ipcMain.on("save", ()=>{
  const NOTIFICATION_TITLE = 'Save video'
const NOTIFICATION_BODY = 'Video successfully saved'
function showNotification () {
  new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}
showNotification(NOTIFICATION_TITLE, NOTIFICATION_BODY)
})
ipcMain.on("download", ()=>{
  const NOTIFICATION_TITLE = 'Download Video'
const NOTIFICATION_BODY = 'Video successfully downloaded'
function showNotification () {
new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
}
showNotification(NOTIFICATION_TITLE, NOTIFICATION_BODY)
})


