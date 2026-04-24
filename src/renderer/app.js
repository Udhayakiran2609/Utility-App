require('angular')
const $ = require('jquery')
const fs = require('fs')
const { clipboard } = require('electron')
const { find } = require("async")
const { ipcMain, ipcRenderer,desktopCapturer } = require("electron")
const path = require('path')
const os = require('os')
// const env = require('../../.env')
// const { initializeApp } = require("firebase/app");
// const { getAnalytics } = require("firebase/analytics");
// const { getDatabase, ref, set, onValue } = require("firebase/database");
// const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCustomToken } = require("firebase/auth");
require("./style.css")
var app = angular.module("myApp", [require('angular-route')])

app.config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: './component/landingpage/landingpage.html',
        })
        .when('/login', {
            templateUrl: './component/loginpage/login.html',
        })
        .when('/register', {
            templateUrl: './component/registerpage/register.html',
        })
        .when('/iscpage', {
            templateUrl: './component/iscpage/iscpage.html',
        })
        .when('/mainpage', {
            templateUrl: './component/mainpage/mainpage.html',
        })

})

app.controller("myController", ["$scope", "$location", "$timeout", function ($scope, $location, $timeout) {
    $scope.userlist = []
    $scope.currentUser = []
    $scope.iscapplication = true
    $scope.navbarTrue = true
    $scope.imageactive = false
    $scope.screenrecordactive = false
    $scope.clipboardactive = false
    $scope.invalidinput = false
    $scope.invalidNumber = false
    $scope.emptyemail = false
    $scope.firstnameValid = false
    $scope.lastnameValid = false
    $scope.passwordValid = false
    $scope.lengthNumber = false
    $scope.passwordValidEmpty = false
    $scope.passwordValid = false
    $scope.validconfirm = false
    $scope.invalidemail = false
    $scope.invalidphonenumber = false
    $scope.invalidpassword = false
    $scope.emailpasswordempty = false
    $scope.emailempty = false
    $scope.passwordempty = false

    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    // var data = process.env.API_KEY
    // console.log(data)
    // const firebaseConfig = {
    //     apiKey: process.env.API_KEY,
    //     authDomain: process.env.AUTH_DOMAIN,
    //     databaseURL: process.env.DATABASE_URL,
    //     projectId: process.env.PROJECT_ID,
    //     storageBucket: process.env.STORAGE_BUCKET,
    //     messagingSenderId: process.env.MESSAGING_SENDER_ID,
    //     appId: process.env.APP_ID,
    //     measurementId: process.env.MEASUREMENT_ID
    // }
    // console.log(firebaseConfig)
    // const app = initializeApp(firebaseConfig);
    // const analytics = getAnalytics(app);
    // const database = getDatabase();
    // const auth = getAuth();
    // Automatic login when user restart the application
    var getCurrentUserFromLocal = localStorage.getItem("currentUser")
    $scope.currentUser = JSON.parse(getCurrentUserFromLocal)
    console.log($scope.currentUser)
    if ($scope.currentUser == undefined) {
        console.log("userlist is undefined")
    }
    else if ($scope.currentUser) {
        console.log("hie")
        $location.path('/iscpage')
    } else {
        $scope.currentUser = []
    }
    // active pages
    $scope.activelogin = false
    $scope.registerlogin = false

    $scope.redirectLogin = () => {
        $scope.activelogin = true
        $scope.registerlogin = false
    }
    $scope.redirectregister = () => {
        $scope.activelogin = false
        $scope.registerlogin = true
    }

    // titiebar

    $scope.closewindow = () => {
        ipcRenderer.send("windowClose")
    }
    $scope.miniwindow = () => {
        ipcRenderer.send("miniClose")
    }

    // Register
    $scope.firstnameValidation = (firstname) => {
        if (firstname == '') {
            $scope.firstnameValid = true
        } else {
            $scope.firstnameValid = false
        }
    }
    $scope.lastnameValidation = (lastname) => {
        if (lastname == '') {
            $scope.lastnameValid = true
        } else {
            $scope.lastnameValid = false
        }
    }
    $scope.passwordValidation = (password) => {
        var passwordpattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        // if(password == ''){
        //     $scope.passwordValidEmpty= true
        //     $scope.passwordValid= false
        if (passwordpattern.test(password) == false) {
            $scope.passwordValid = true
            // $scope.passwordValidEmpty= false
        }

        else {
            $scope.passwordValid = false
            // $scope.passwordValidEmpty= false
        }
    }

    $scope.validEmail = (email) => {
        var reexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (email == '') {
            $scope.emptyemail = true
            $scope.invalidinput = false
        }
        else if (reexp.test(email) == true) {
            $scope.invalidinput = false
            $scope.emptyemail = false
        }
        else {
            $scope.invalidinput = true
            $scope.emptyemail = false
        }
    }
    $scope.validNumber = (number) => {
        var regex = /^(?:(?:\(?(?:00|\+)([1-4]\d\d|[1-9]\d?)\)?)?[\-\.\ \\\/]?)?((?:\(?\d{1,}\)?[\-\.\ \\\/]?){0,})(?:[\-\.\ \\\/]?(?:#|ext\.?|extension|x)[\-\.\ \\\/]?(\d+))?$/i;
        if (number.length < 11) {
            $scope.lengthNumber = true
            $scope.invalidNumber = false
            if (regex.test(number)) {
                $scope.invalidNumber = false
                $scope.lengthNumber = false

            }
        }
        else {
            $scope.invalidNumber = true
            $scope.lengthNumber = false

        }
    }


    //   var passwordpattern = "^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"


    $scope.signup = (firstname, lastname, email, number, password, confirmpassword) => {
        // var invalidinput = email.$valid
        // if(invalidinput == false){
        //     $scope.invalidinput = true
        // }

        if (password !== confirmpassword) {
            $scope.validconfirm = true
        } else {
            $scope.validconfirm = false
        }
        var reexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        console.log(firstname, lastname, email, number, password, confirmpassword)
        if (reexp.test(email)) {

            if (firstname, lastname, email, number, password, confirmpassword) {
                if (password == confirmpassword) {
                    console.log(password)
                    ipcRenderer.send("register-auth", email, password)
                    $scope.localstorageUsers = localStorage.getItem("user")
                    if ($scope.localstorageUsers !== null) {
                        $scope.userlist = []
                        $scope.toParse = JSON.parse($scope.localstorageUsers)
                        for (var i = 0; i < $scope.toParse.length; i++) {
                            var userlocal = {
                                firstname: $scope.toParse[i].firstname,
                                lastname: $scope.toParse[i].lastname,
                                email: $scope.toParse[i].email,
                                number: $scope.toParse[i].number,
                                password: $scope.toParse[i].password,
                                confirmpassword: $scope.toParse[i].confirmpassword,
                                resizeimages: $scope.toParse[i].resizeimages,
                                recorder: $scope.toParse[i].recorder
                            }
                            $scope.userlist.push(userlocal)
                        }
                        localStorage.removeItem("user")
                    }
                    var user = {
                        firstname, lastname, email, number, password, confirmpassword, resizeimages: [], recorder: []
                    }
                    $scope.userlist.push(user)
                    const allUserlist = JSON.stringify($scope.userlist)
                    localStorage.setItem(`user`, allUserlist)

                    // setTimeout(() => {
                    //     $location.path('/login')
                    // }, 3000);
                    // $("#registerDone").text("")
                    $("#loadingDone").addClass("imagegif")
                    $("#loadingDone").attr("src", "../../assests/loading.gif")
                    $timeout(function () {
                        $scope.activelogin = true
                        $scope.registerlogin = false
                        $("#loadingDone").removeClass("imagegif")
                        $location.path('/login')

                    }, 2000);


                    // $('#registerDone').attr("href", "#!/login")
                }
            }


        }

    }

    // Login

    $scope.login = (email, password) => {
        console.log(email, password)
        if (email == undefined & password == undefined) {
            $scope.emailpasswordempty = true
            $scope.emailempty = false
            $scope.passwordempty = false
        }
        else if (email == undefined) {
            $scope.emailpasswordempty = false
            $scope.emailempty = true
            $scope.passwordempty = false
        }
        else if (password == undefined) {
            $scope.emailpasswordempty = false
            $scope.emailempty = false
            $scope.passwordempty = true
        }
        if (email, password) {
            $scope.emailpasswordempty = false
            $scope.emailempty = false
            $scope.passwordempty = false
            console.log(email, password)
            $scope.getUserForLogin = (localStorage.getItem("user"))
            $scope.loginUsers = JSON.parse($scope.getUserForLogin)
            console.log($scope.loginUsers)
            var findUser = $scope.loginUsers.find((e) => {
                return e.email == email || e.number == email
            })
            console.log(findUser)
            if (findUser == undefined) {
                $scope.invalidemail = true
                $scope.invalidphonenumber = false
                $scope.invalidpassword = true
            } else if (findUser.password !== password) {
                $scope.invalidpassword = true
                $scope.invalidemail = false
                $scope.invalidphonenumber = false
            }

            else {
                ipcRenderer.send("login-auth", email, password)
                $scope.currentUser = findUser
                var localLoginUser = JSON.stringify($scope.currentUser)
                localStorage.setItem("currentUser", localLoginUser)
                var getCurrentUserFromLocal = localStorage.getItem("currentUser")
                var currentUserFromLocal = JSON.parse(getCurrentUserFromLocal)
                console.log(currentUserFromLocal.email)
                console.log(currentUserFromLocal.number)

                if (currentUserFromLocal.email == email || currentUserFromLocal.number == email && currentUserFromLocal.password == password) {
                    $("#loadingLogin").addClass("imagegif")
                    $("#loadingLogin").attr("src", "../../assests/loading.gif")
                    $timeout(function () {
                        $("#loadingLogin").removeClass("imagegif")
                        $location.path('/iscpage')

                    }, 2000);

                }
            }

        }
    }

    // Backhome

    // $scope.backhome = ()=>{

    // }

    // logOut

    $scope.logout = () => {
        $scope.currentUser = []
        localStorage.removeItem("currentUser")
        $scope.invalidemail = false
        $scope.invalidphonenumber = false
        $scope.invalidpassword = false
    }

    // choosed app
    // $scope.imageresizetrue = false
    // $scope.screenrecordertrue = false
    // $scope.clipboardtrue = false
    $scope.imageView = false
    $scope.imageresizer = () => {
        $('#image-resizer').addClass("active-div")
        $('#image-resizer').siblings().removeClass("active-div")
        $scope.imageresizetrue = true
        $scope.screenrecordertrue = false
        $scope.clipboardtrue = false
        $scope.previewmodalvideotrue = false
        $scope.iscapplication = true
        $scope.previewmodaltrue = false
        $scope.imageactive = true
        $scope.screenrecordactive = false
        $scope.clipboardactive = false
    }

    $scope.screenrecorder = () => {
        $('#screen-recorder').addClass("active-div")
        $('#screen-recorder').siblings().removeClass("active-div")
        $scope.imageresizetrue = false
        $scope.screenrecordertrue = true
        $scope.clipboardtrue = false
        $scope.previewmodalvideotrue = false
        $scope.iscapplication = true
        $scope.previewmodaltrue = false
        $scope.imageactive = false
        $scope.screenrecordactive = true
        $scope.clipboardactive = false
    }
    $scope.clipboard = () => {
        $('#clipboard').addClass("active-div")
        $('#clipboard').siblings().removeClass("active-div")
        $scope.imageresizetrue = false
        $scope.previewmodalvideotrue = false
        $scope.clipboardtrue = true
        $scope.screenrecordertrue = false
        $scope.iscapplication = true
        $scope.previewmodaltrue = false
        $scope.imageactive = false
        $scope.screenrecordactive = false
        $scope.clipboardactive = true
    }
    $scope.imageResizer = () => {
        $('#image-resizer').addClass("active-div")
        $('#image-resizer').siblings().removeClass("active-div")
        $scope.imageresizetrue = true
        $scope.screenrecordertrue = false
        $scope.clipboardtrue = false
        $scope.previewmodalvideotrue = false
        $scope.iscapplication = true
        $scope.previewmodaltrue = false
        // recorder.stop()
        // $(".forchangingAction").html("Screen record is successfully recorded")
    }

    $scope.screenRecorder = () => {
        $('#screen-recorder').addClass("active-div")
        $('#screen-recorder').siblings().removeClass("active-div")
        $scope.imageresizetrue = false
        $scope.clipboardtrue = false
        $scope.previewmodalvideotrue = false
        $scope.iscapplication = true
        $scope.screenrecordertrue = true
        $scope.previewmodaltrue = false
    }
    $scope.clipBoard = () => {
        $('#clipboard').addClass("active-div")
        $('#clipboard').siblings().removeClass("active-div")
        $scope.imageresizetrue = false
        $scope.screenrecordertrue = false
        $scope.clipboardtrue = true
        $scope.previewmodalvideotrue = false
        // recorder.stop()
        $scope.iscapplication = true
        $scope.previewmodaltrue = false
        // $(".forchangingAction").html("Screen record is successfully recorded")
    }

    // selected Image
    $scope.whenImageDone = true
    $scope.selectedImg = (event, selectedimage) => {
        console.log(selectedimage)
        $scope.files = event.target.files;
        console.log($scope.files)
        // console.log($scope.files.width, $scope.files.height)
        $scope.filePath = $scope.files[0].path
        // $scope.widthValue = $scope.filePath.width
        // console.log($scope.widthValue)
        // $scope.heightValue = $scope.filePath.height
        // async function getMetadata(filepath) {
        //     try {
        //       const metadata = await sharp(filepath).metadata();
        //       console.log(metadata);
        //       $("#widthVal").val(metadata.width)
        //       $("#heightVal").val(metadata.height)
        //     } catch (error) {
        //       console.log(`An error occurred during processing: ${error}`);
        //     }
        //   }

        //   getMetadata($scope.filePath);
        $("#setImage").attr("src", $scope.filePath)
        $("#setImage").addClass("setImage-div-block")
        $(".img-width-height").addClass("setImage-div-block")
        $(".resize-one").addClass("setImage-div-block")
    };

    $scope.resize = (widthValue, heightValue) => {
        if (widthValue && heightValue) {
            $(".convert-btn").addClass("setImage-div-block")
            $('.preview-one').addClass("whenImageDone")
            $(".whenTrue").removeClass("setImage-div-block")
            $(".whenwidthTrue").removeClass("setImage-div-block")
            $(".whenheightTrue").removeClass("setImage-div-block")
            // $("#resize").InnerText = "Done"
            // $("#resize").addClass("green")
            // $scope.widthValue=""
            // $scope.heightValue=""
        } else if (widthValue) {
            $(".whenheightTrue").addClass("setImage-div-block")
            $(".whenwidthTrue").removeClass("setImage-div-block")
            $(".convert-btn").removeClass("setImage-div-block")
            $(".whenTrue").removeClass("setImage-div-block")
            $('.preview-one').removeClass("whenImageDone")
        } else if (heightValue) {
            $(".whenwidthTrue").addClass("setImage-div-block")
            $(".whenheightTrue").removeClass("setImage-div-block")
            $(".whenTrue").removeClass("setImage-div-block")
            $(".convert-btn").removeClass("setImage-div-block")
            $('.preview-one').removeClass("whenImageDone")
        }
        else {
            $(".whenTrue").addClass("setImage-div-block")
            $(".whenwidthTrue").removeClass("setImage-div-block")
            $(".whenheightTrue").removeClass("setImage-div-block")
            $(".convert-btn").removeClass("setImage-div-block")
            $('.preview-one').removeClass("whenImageDone")
        }

    }
    $scope.save = (widthValue, heightValue) => {
        if (widthValue, heightValue) {
            // var imgPath = $scope.filePath
            const input = document.getElementById('choosefiles');
            // console.log(input.files , input.files[0])
            // var inputfiles = input.files
            // var inputfiles_0 = input.files[0]
            var width = Number(widthValue)
            var height = Number(heightValue)
            var getUser = localStorage.getItem("user")
            var toParsethis = JSON.parse(getUser)
            var getCurrentUserFromLocal = localStorage.getItem("currentUser")
            var currentUserFromLocal = JSON.parse(getCurrentUserFromLocal)
            $scope.findCurrentUser = toParsethis.findIndex((e) => {
                return e.email == currentUserFromLocal.email
            })
            if (input.files && input.files[0]) {
                console.log(input.files, input.files[0])
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = new Image();
                    img.src = e.target.result;

                    img.onload = function () {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        const resizedDataUrl = canvas.toDataURL('image/png'); // Change format if needed
                        // var a = document.createElement('a');
                        // a.href = resizedDataUrl;
                        // a.download = resizedDataUrl;
                        // document.body.appendChild(a);
                        // a.click();
                        // document.body.removeChild(a);
                        var resizeimageproperty = {
                        filename: $scope.files[0].name,
                        resizedDataUrl,
                        width,
                        height
                    }
                    var dest = path.join(__dirname, "../","../","resizedImage");
                    // const blob = b64toBlob(resizedDataUrl)
                    // const imageUrl = window.URL.createObjectURL(blob);
                    console.log(dest)
                    console.log(resizeimageproperty.filename)
                    console.log(resizeimageproperty.resizedDataUrl)
                    fs.writeFileSync(path.join(dest, resizeimageproperty.filename), resizeimageproperty.resizedDataUrl);
                    setResizeImage(resizeimageproperty)
                    function setResizeImage(resizeimageproperty) {
                        let str = resizeimageproperty.filename
                        var name = str = str.slice(0, -4);
                        console.log(name)
                        set(ref(database, 'users/resizedimage/' + name), {
                            filename: resizeimageproperty.filename,
                            resizedDataUrl: resizeimageproperty.resizedDataUrl,
                            width: resizeimageproperty.width,
                            height: resizeimageproperty.height
                        });
                    }

                    console.log(resizeimageproperty)
                    toParsethis[$scope.findCurrentUser].resizeimages.push(resizeimageproperty)
                    currentUserFromLocal.resizeimages.push(resizeimageproperty)
                    var currentUser = JSON.stringify(currentUserFromLocal)
                    var user = JSON.stringify(toParsethis)
                    localStorage.setItem("currentUser", currentUser)
                    localStorage.setItem("user", user)
                    ipcRenderer.send("saveimage")
                    console.log(resizedDataUrl);
                };
            };
            reader.readAsDataURL(input.files[0]);
        }
        // console.log($scope.findCurrentUser)
        // var resizeimageproperty = {
        //     filename: $scope.files[0].name,
        //     resizedDataUrl : $scope.resizedDataUrl,
        //     width,
        //     height
        // }
        // console.log(resizeimageproperty)


    }

}
    $scope.convertImage = (widthValue, heightValue) => {
        console.log(widthValue, heightValue, $scope.files, $scope.filePath)
        var files = $scope.files
        // var imgPath = $scope.filePath
        var width = Number(widthValue)
        var height = Number(heightValue)
        console.log(width, height);
        const input = document.getElementById('choosefiles');
        if (input.files && input.files[0]) {
            console.log(input.files, input.files[0])
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.src = e.target.result;

                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const resizedDataUrl = canvas.toDataURL('image/jpeg');
                    console.log(resizedDataUrl);
                    var a = document.createElement('a');
                    a.href = resizedDataUrl;
                    a.download = resizedDataUrl;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    // ipcRenderer.send("downloadimage")
                };
            };

            reader.readAsDataURL(input.files[0]);
        }

        // async function resizeImage(imgPath, width, height) {
        //     try {
        //         console.log(imgPath, width, height);
        //         const newPath = await resizeImg(fs.readFileSync(imgPath), {
        //             width: +width,
        //             height: +height,
        //         });
        //         const content = new Uint8Array(newPath)
        //         console.log(content)
        //         const downloadpath = new Blob([content.buffer], { type: 'image/png' })
        //         const imageUrl = window.URL.createObjectURL(downloadpath);
        //         console.log(downloadpath)
        //         var a = document.createElement('a');
        //         console.log(newPath)
        //         a.href = imageUrl;
        //         a.download = imageUrl;
        //         document.body.appendChild(a);
        //         a.click();
        //         document.body.removeChild(a);
        //         //   win.webContents.send("imagepath", newPath)
        //         // const filename = path.basename(imgPath);
        //         // if (!fs.existsSync(dest)) {
        //         //   fs.mkdirSync(dest);
        //         // }
        //         // fs.writeFileSync(path.join(dest, filename), newPath);
        //         // // win.webContents.send('image:done');
        //         // shell.openPath(dest);
        //     } catch (err) {
        //         console.log(err);
        //     }
        // }
        // resizeImage(imgPath, width, height)
        // ipcRenderer.send("resize:img",
        // {
        //    imgPath,
        //  width, 
        //  height
        //     }
        //     )
        //     ipcRenderer.on("imagepath", (e, newPath)=>{
        //         const content = new Uint8Array(newPath)
        //        const downloadpath =  new Blob([content.buffer], { type: 'image/png' } )
        //        console.log(downloadpath)
        //       const imageUrl = window.URL.createObjectURL(downloadpath);
        //         var a = document.createElement('a'); 
        //         console.log(newPath)
        //         a.href = imageUrl;
        //   a.download = imageUrl;
        //   document.body.appendChild(a);
        //   a.click();
        //   document.body.removeChild(a);
        //     })

        //   const filename = path.basename(imgPath);
        //   console.log(filename)




        //  var resizeimageproperty = {
        //     imgPath,
        //     width,
        //     height
        //  }
        // localStorage.setItem("currentUser[resizeimage]", resizeimageproperty)


        ipcRenderer.on("download:done", () => {
            ipcRenderer.send("downloadimage")
        })


    }



    $scope.previewmodaltrue = false
    $scope.preview = () => {
        $scope.navbarTrue = false
        $scope.imageresizetrue = false
        $scope.iscapplication = false
        $scope.previewmodaltrue = true
        var getUser = localStorage.getItem("user")
        var toParse = JSON.parse(getUser)
        var getCurrentUserFromLocal = localStorage.getItem("currentUser")
        var currentUserFromLocal = JSON.parse(getCurrentUserFromLocal)
        $scope.findCurrentUser = toParse.findIndex((e) => {
            return e.email == currentUserFromLocal.email
        })
        $scope.currentUserResizedImage = toParse[$scope.findCurrentUser].resizeimages
        console.log($scope.currentUserResizedImage)

    }
    $scope.closeModal = () => {
        $scope.imageView = false
    }

    $scope.viewimage = (resizeimage) => {
        $scope.previewmodal = true
        $scope.imageView = true
        $scope.imageurl = []
        const resizedDataUrl = resizeimage.resizedDataUrl
        console.log(resizedDataUrl)
        $scope.imageurl.push(resizedDataUrl)
        console.log($scope.imageurl)

    }

    $scope.download = (resizeimage) => {
        const resizedDataUrl = resizeimage.resizedDataUrl
        var a = document.createElement('a');
        a.href = resizedDataUrl;
        a.download = resizedDataUrl;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    $scope.delete = (resizeimage) => {
        var getUser = localStorage.getItem("user")
        var toParse = JSON.parse(getUser)
        var getCurrentUserFromLocal = localStorage.getItem("currentUser")
        var currentUserFromLocal = JSON.parse(getCurrentUserFromLocal)
        $scope.findCurrentUser = toParse.findIndex((e) => {
            return e.email == currentUserFromLocal.email
        })
        $scope.findResizeImage = toParse[$scope.findCurrentUser].resizeimages.findIndex((e) => {
            return e.filename == resizeimage.filename
        })
        toParse[$scope.findCurrentUser].resizeimages.splice($scope.findResizeImage, 1)
        console.log(toParse)
        currentUserFromLocal.resizeimages.splice($scope.findResizeImage, 1)
        var user = JSON.stringify(toParse)
        var currentUser = JSON.stringify(currentUserFromLocal)
        localStorage.setItem("user", user)
        localStorage.setItem("currentUser", currentUser)
        $scope.currentUserResizedImage.splice($scope.findResizeImage, 1)
    }




    // screen recordingg...

    let recorder
    var blobs = []

$scope.screenrecording = false
$scope.startBtn = () => {
    var video = document.getElementById('videoElement')
    video.style.display = "block"
    video.style.margin = "0 auto"
    $scope.screenrecording = true
    $(".RemoveWhenStart").attr("style", "display:none;")
    $("#startRecording").addClass("setImage-div-block")
    $(".videorecord").addClass("setImage-div-block")
    $(".onload-preview").attr("style", "display:none;")
    $(".successfull").removeClass("setImage-div-block")
    $(".successfull").attr("style", "display:none;")
    $(".video-btns").removeClass("setImage-div-block")
    ipcRenderer.send("screenRecord")
    ipcRenderer.send("miniClose")
}




ipcRenderer.on('SET_SOURCE', async (event, sourceId) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            // audio: {
            //     mandatory: {
            //       chromeMediaSource: 'desktop',
            //       chromeMediaSourceId: sourceId,
            //     }
            // },
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                }
            }
        })
        handleStream(stream)
    } catch (e) {
        handleError(e)
    }
})

function handleStream(stream) {

    // // $("#videoElement").attr("src", stream)
    // video.onloadedmetadata = (e) => video.play()

    recorder = new MediaRecorder(stream);
    blobs = [];
    recorder.ondataavailable = function (event) {
        blobs.push(event.data);
    };
    console.log(recorder)
    recorder.start();
    var video = document.getElementById('videoElement')
    video.srcObject = recorder.stream
}

function handleError(e) {
    console.log(e)
}

$scope.downloadVideo = () => {
    var randomNumbers = Math.floor(Math.random() * 10000000000)
    toArrayBuffer(new Blob(blobs, { type: 'video/webm' }), function (ab) {
        var buffer = toBuffer(ab);
        var file = path.join(os.homedir(), `downloads/screenrecorder${randomNumbers}.webm`);
        fs.writeFile(file, buffer, function (err) {
            if (err) {
                console.error('Failed to save video ' + err);

            } else {
                console.log('Saved video: ' + file);
                ipcRenderer.send("download")
            }
        });
        $(".forchangingAction").html("Screen record is successfully downloaded")
        $(".onload-preview").removeAttr("style")
        $(".video-btns").removeClass("setImage-div-block")
    })

    $timeout(function () {
        $(".forchangingAction").html("Click Start to record")
        $(".video-btns").removeClass("setImage-div-block")
        // $(".onload-preview").attr("style","display:block; !important")
    }, 3000);
}
ipcRenderer.on("stopRecording", () => {

    function blobToBase64(blob) {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob[0]);
        });
    }
    recorder.onstop = async (e) => {
        console.log("data available after MediaRecorder.stop() called.");
        const blob = new Blob(blobs, { type: "video/webm" });
        console.log(blob)
        const videoUrl = window.URL.createObjectURL(blob);
        $scope.blobUrl = videoUrl
        console.log(videoUrl)
        // $('.aaa')[0].src = videoUrl;
        $scope.base64 = await blobToBase64(blobs);
        console.log($scope.base64)
    };
    recorder.stop();
    if ($scope.screenrecording) {
        $(".RemoveWhenStart").removeAttr("style")
        $("#startRecording").removeClass("setImage-div-block")
        $(".video-btns").addClass("setImage-div-block")
        $(".onload-preview").attr("style", "display:none;")
        $(".successfull").addClass("setImage-div-block")
        $('.preview-one').removeClass("whenImageDone")
    }

    var video = document.getElementById('videoElement')
    video.srcObject = null
    video.style.display = "none"
    $(".successfull").addClass("setImage-div-block")
    toArrayBuffer(new Blob(blobs, { type: 'video/webm' }), function (ab) {
        var buffer = toBuffer(ab);
    });
    if ($scope.screenrecording == true) {
        $(".forchangingAction").html("Screen record is successfully recorded")
    } else {
        $(".forchangingAction").html("Please start recording and stop")
    }
    $scope.screenrecording = false
})

$scope.stopBtn = () => {
    function blobToBase64(blob) {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob[0]);
        });
    }
    recorder.onstop = async (e) => {
        console.log("data available after MediaRecorder.stop() called.");
        const blob = new Blob(blobs, { type: "video/webm" });
        console.log(blob)
        const videoUrl = window.URL.createObjectURL(blob);
        $scope.blobUrl = videoUrl
        console.log(videoUrl)
        // $('.aaa')[0].src = videoUrl;
        $scope.base64 = await blobToBase64(blobs);
        console.log($scope.base64)
    };
    recorder.stop();
    if ($scope.screenrecording) {
        $(".RemoveWhenStart").removeAttr("style")
        $("#startRecording").removeClass("setImage-div-block")
        $(".video-btns").addClass("setImage-div-block")
        $(".onload-preview").attr("style", "display:none;")
        $(".successfull").addClass("setImage-div-block")
        $('.preview-one').removeClass("whenImageDone")
    }

    var video = document.getElementById('videoElement')
    video.srcObject = null
    video.style.display = "none"
    $(".successfull").addClass("setImage-div-block")
    toArrayBuffer(new Blob(blobs, { type: 'video/webm' }), function (ab) {
        var buffer = toBuffer(ab);
    });
    if ($scope.screenrecording == true) {
        $(".forchangingAction").html("Screen record is successfully recorded")
    } else {
        $(".forchangingAction").html("Please start recording and stop")
    }
    $scope.screenrecording = false
};

function toArrayBuffer(blob, cb) {
    let fileReader = new FileReader();
    fileReader.onload = function () {
        let arrayBuffer = this.result;
        console.log(arrayBuffer)
        cb(arrayBuffer);
    };
    fileReader.readAsArrayBuffer(blob);
}
function toBuffer(ab) {
    console.log(Buffer.from(ab))
    return Buffer.from(ab);
}


$scope.saveVideo = () => {
    // $(".loadingImg").addClass("setImage-div-block")
    toArrayBuffer(new Blob(blobs, { type: 'video/webm' }), function (ab) {
        var buffer = toBuffer(ab);
        console.log(buffer)
        var blobUrl = URL.createObjectURL(blobs[0]);
        console.log(blobUrl)
        var getUser = localStorage.getItem("user")
        var toParsethis = JSON.parse(getUser)
        var getCurrentUserFromLocal = localStorage.getItem("currentUser")
        var currentUserFromLocal = JSON.parse(getCurrentUserFromLocal)
        $scope.findCurrentUser = toParsethis.findIndex((e) => {
            return e.email == currentUserFromLocal.email
        })
        console.log($scope.findCurrentUser)
        var randomNumbers = Math.floor(Math.random() * 10000000000)
        var filename = `screenrecord_${randomNumbers}`
        var screenRecord = {
            filename,
            buffer,
            blob: $scope.blobUrl,
            base64: $scope.base64
        }
        console.log(screenRecord)
        toParsethis[$scope.findCurrentUser].recorder.push(screenRecord)
        currentUserFromLocal.recorder.push(screenRecord)
        var currentUser = JSON.stringify(currentUserFromLocal)
        var user = JSON.stringify(toParsethis)
        localStorage.setItem("currentUser", currentUser)
        localStorage.setItem("user", user)
        ipcRenderer.send("save")
    })
    $(".forchangingAction").html("Screen record is successfully Saved")
    $timeout(function () {
        $(".forchangingAction").html("Click Start to record")
        $(".video-btns").removeClass("setImage-div-block")
        $(".onload-preview").removeAttr("style")
    }, 3000);

}
function b64toBlob(dataURI) {

    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);

    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'video/webm' });
}
$scope.convertedblogUrl = []
$scope.videoView = false

$scope.downloadVideoFromPreview = (recordVideo) => {
    $scope.previewmodalvideotrue = true
    $scope.videoView = true
    $scope.convertedblogUrl = []
    const base64String = recordVideo.base64
    const blob = b64toBlob(base64String)
    const videoUrl = window.URL.createObjectURL(blob);
    $scope.convertedblogUrl.push(videoUrl)
    console.log(videoUrl)
    console.log(recordVideo.buffer)
    console.log(recordVideo.base64)

    // Assume base64String is your Base64-encoded string


    // console.log(blob)
    // $(".aaa")[0].src = recordVideo.blob
    // var randomNumbers = Math.floor(Math.random()*10000000000)
    //     toArrayBuffer(new Blob(blobs, {type: 'video/webm'}), function(ab) {

    //     var file = path.join(os.homedir(), `downloads/screenrecord.wepm`);
    //     fs.writeFile(file, recordVideo.blob, function(err) {
    //         if (err) {
    //             console.error('Failed to save video ' + err);
    //         } else {
    //             console.log('Saved video: ' + file);
    //         }
    //     });
    // })
}
$scope.deleteVideo = (recordVideo) => {
    $scope.convertedblogUrl = []
    var getUser = localStorage.getItem("user")
    var toParse = JSON.parse(getUser)
    var getCurrentUserFromLocal = localStorage.getItem("currentUser")
    var currentUserFromLocal = JSON.parse(getCurrentUserFromLocal)
    $scope.findCurrentUser = toParse.findIndex((e) => {
        return e.email == currentUserFromLocal.email
    })
    $scope.findResizeImage = toParse[$scope.findCurrentUser].recorder.findIndex((e) => {
        return e.filename == recordVideo.filename
    })
    toParse[$scope.findCurrentUser].recorder.splice($scope.findResizeImage, 1)
    console.log(toParse)
    currentUserFromLocal.recorder.splice($scope.findResizeImage, 1)
    var user = JSON.stringify(toParse)
    var currentUser = JSON.stringify(currentUserFromLocal)
    localStorage.setItem("user", user)
    localStorage.setItem("currentUser", currentUser)
    $scope.currentRecorderVideo.splice($scope.findResizeImage, 1)

}

$scope.previewmodalvideotrue = false
$scope.previewVideo = () => {
    $scope.navbarTrue = false
    $scope.screenrecordertrue = false
    $scope.iscapplication = false
    $scope.previewmodalvideotrue = true
    var getUser = localStorage.getItem("user")
    var toParse = JSON.parse(getUser)
    var getCurrentUserFromLocal = localStorage.getItem("currentUser")
    var currentUserFromLocal = JSON.parse(getCurrentUserFromLocal)
    $scope.findCurrentUser = toParse.findIndex((e) => {
        return e.email == currentUserFromLocal.email
    })
    $scope.currentRecorderVideo = toParse[$scope.findCurrentUser].recorder
    console.log($scope.currentRecorderVideo)

}
$scope.closeModalVideo = () => {
    $scope.videoView = false
}
$scope.backBtn = () => {
    $scope.navbarTrue = true
    $scope.iscapplication = true
    $scope.previewmodalvideotrue = false
    $scope.screenrecordertrue = true
    $scope.previewmodaltrue = false
    $scope.imageactive = false
    $scope.screenrecordactive = true
    $scope.clipboardactive = false
}
$scope.backBtnImg = () => {
    $scope.navbarTrue = true
    $scope.iscapplication = true
    $scope.previewmodalvideotrue = false
    $scope.imageresizetrue = true
    $scope.previewmodaltrue = false
    $scope.imageactive = true
    $scope.screenrecordactive = false
    $scope.clipboardactive = false
}


// Clipboard
ipcRenderer.on('copied', (e, coppiedContent) => {
    var inputValue = $("#copiedInput").val()
    if (inputValue == "") {
        $("#copiedInput").val(coppiedContent)
    } else {
        $("#copiedInput").val(inputValue + " " + coppiedContent)
    }

});
$scope.saveText = () => {
    var inputText = $("#copiedInput").val()
    var filename = $("#filename").val()
    if (inputText && filename) {
        var fileNdInput = {
            inputText,
            filename
        }
        console.log(inputText)
        ipcRenderer.send("input-text", fileNdInput)
        // setTimeout(()=>{
        //     $("#copiedInput").val('')
        //     $("#filename").val('')
        // }, 500)

    }
}
}])



