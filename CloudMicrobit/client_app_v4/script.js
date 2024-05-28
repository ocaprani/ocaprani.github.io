


let canvas = document.querySelector("#canvas");
// console.log("CANVAS", canvas)
let context = canvas.getContext('2d');
// let canvasColor = canvas.style.backgroundColor;

tempText = document.getElementById("temp");
lightText = document.getElementById("lys");

let microbitConnected = false;
connectMicroButton.onclick = connectMicroClicked;

let connectServerButton = document.getElementById("connectServerButton");
connectServerButton.onclick = connectToServerClicked;

// let serverStuffDiv = document.getElementById("onServerStuff");
let onClientStuff = document.getElementById("onClientStuff");

let dropdownEmoji = document.getElementById("dropdown-emoji");
dropdownEmoji.value = "default";
dropdownEmoji.onchange = changeEmoji;

let dropdownImg = document.getElementById("dropdown-img");
dropdownEmoji.value = "default";
dropdownImg.onchange = changeDropdownImg;

let allLoadedImgs = [];


let ternCheckbox = document.getElementById("ternCheckbox");
ternCheckbox.onchange = redrawCanvas;
let haleCheckbox = document.getElementById("haleCheckbox");
haleCheckbox.onchange = function(event) {
    if (isSocketOpen()) {
        postDrawTail(myUserID, event.target.checked);
    }
    redrawCanvas();
}

let onServer = false;
let socket = null;
let myUserID = String(Math.floor(Math.random() * 10000));
// let userIDfield = document.getElementById("inputField");
// if (userIDfield !== null) {
//     userIDfield.value = myUserID;
// }

let fileEl = document.getElementById("load_element");

let colors = ["red", "blue", "green", "yellow", "purple"];
let userColor = colors[myUserID.charCodeAt(0) % colors.length];
context.fillStyle = userColor;

addUser(myUserID, userColor);
addDataToUser(myUserID, {x: canvas.width / 2, y: canvas.height / 2}, 20)

let colorPicker = document.getElementById("colorPicker");
colorPicker.value = context.fillStyle;
colorPicker.oninput = function(event) {
    // context.fillStyle = event.target.value;
    users[myUserID].color = event.target.value;
    redrawCanvas();
}

colorPicker.onchange = function(event) {
    if (isSocketOpen()) {
        postColor(myUserID, event.target.value);
    }
}

// changeMode();
// changeEmoji();
// connectToServer();



// remove empty option from dropdown when opened
// dropdownEmoji.onclick = function() {
//     if (dropdownEmoji.options[dropdownEmoji.options.length - 1].value === "") {
//         dropdownEmoji.remove(dropdownEmoji.options.length - 1);
//     }
// }


function isSocketOpen() {
    return socket !== null && socket.readyState === 1;
}


function handleData(message) {
  if (message === "Button A") {
    return;
  } else if (message === "Button B") {
    return;
  } else {
    let data = message.split(",");
    let x = Number(data[0]);
    let y = Number(data[1]);
   
    let temperature = Number(data[2]);
    let light = Number(data[3]);
    if (Number.isNaN(light)) {
        light = 0;
    }

    x = (canvas.width / 2) + (x / 1000) * canvas.width/2;
    y = (canvas.height / 2) - (y / 1000) * canvas.height/2;
    x = Math.round(x);
    y = Math.round(y);
    
    addDataToUser(myUserID, {x: x, y: y}, temperature, light);
    
    
    // console.log(x,y,temperature,light);
    console.log(light);
    updateTextbox(temperature, light);

    if (isSocketOpen() && onServer) {
      postCoordinates(myUserID, {x: x, y: y}, temperature, light);
    }

  }
}


function redrawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    let myUser = users[myUserID];
    if (myUser === undefined || !microbitConnected) {
        if (ternCheckbox.checked && !onServer) {
            drawGrid();
        }
        return;
    }

    if (ternCheckbox.checked && !onServer) {
        let coords = getCurrentUserCoords(myUser);
        drawGrid(coords.x, coords.y);
    }
    if (haleCheckbox.checked) {
        drawTail(myUser);
    }
    drawFigure(myUser);
    


    // if (onServer) {
    //     if (haleCheckbox.checked) {
    //         drawTail(myUser);
    //     }
    //     drawFigure(myUser);
    // } else {
    //     if (ternCheckbox.checked) {
    //         let coords = getCurrentUserCoords(myUser);
    //         drawGrid(coords.x, coords.y);
    //     }
    //     if (haleCheckbox.checked) {
    //         drawTail(myUser);
    //     }
    //     drawHead(myUser);
    // }

}


function updateTextbox(temperature, light) {
    tempText.textContent = `Temperatur: ${temperature.toFixed(0)}°C`;
    lightText.textContent = `Lysstyrke: ${light}`;
}


// Callback when the dropdown changes
// function changeMode(event) {
//     let value = dropdown.value;
    
//     context.clearRect(0, 0, canvas.width, canvas.height);
//     redrawCanvas();

//     if (isSocketOpen()) {
//         if (value === "2") {
//             postEmoji(myUserID, users[myUserID].emoji);
//         }
//         postDrawOnServer(myUserID, value === "2");
//     }
// }


function changeEmoji(event) {

    dropdownImg.value = "default";

    let emoji;
    if (dropdownEmoji.value === "default") {
        emoji = null;
    }
    else {
        emoji = dropdownEmoji.options[dropdownEmoji.selectedIndex].text;
        users[myUserID].img = null;
    }

    users[myUserID].emoji = emoji;

    redrawCanvas();
    if (isSocketOpen()) {
        postEmoji(myUserID, emoji);
    }
}



function changeDropdownImg(event) {

    dropdownEmoji.value = "default";

    let img;
    if (dropdownImg.value === "default") {
        img = null;
    }
    else {
        let imgIndex = dropdownImg.selectedIndex;
        console.log("Selected img index: ", imgIndex)
        img = allLoadedImgs[imgIndex-1];
        users[myUserID].emoji = null;
    }

    users[myUserID].img = img;

    redrawCanvas();

    if (isSocketOpen()) {
        postImage(myUserID, img);
    }
}



function loadImg(event) {
    users[myUserID].emoji = null;

    var file = event.target.files[0];
    
    let option = document.createElement("option");
    // option.style.display = "none";
    
    // Cut off and add dots if too long
    let fileName = file.name;
    let maxNameLength = dropdownImg.options[0].text.length;
    if (fileName.length > maxNameLength) {
        fileName = fileName.substring(0, maxNameLength - 3) + "...";
    }
    option.text = fileName;
    // option.value = "";
    dropdownImg.add(option);
    dropdownImg.value = fileName;

    dropdownEmoji.value = "default";


    if (file.type == "image/png" || file.type == "image/jpeg") {
        console.log("Image file selected:", file.name);
        var reader = new FileReader();
        reader.onload = function (event) {
            console.log("Image loaded");
            var img = new Image();
            img.onload = function () {
                handleImg(img, imgSizes.widthHigh * figSizeMult, imgSizes.heightHigh * figSizeMult);
            }
            img.src = event.target.result;
        }
        
        // reader.onload = function (event) {
        //     console.log("Image loaded");
        //     var img = new Image();
        //     img.src = event.target.result;
        //     img.onload = function () {
        //         resizeImage(img, imgSizes.widthHigh * figSizeMult, imgSizes.heightHigh * figSizeMult)
        //         // img.width = imgSizes.widthHigh * figSizeMult;
        //         // img.height = imgSizes.heightHigh * figSizeMult;
        //         // console.log("Image loaded: ", img.src);
        //         users[myUserID].img = img;
        //         users[myUserID].emoji = null;
        //         redrawCanvas();
        //         postImage(myUserID, img);
        //         allLoadedImgs.push(img);
        //         fileEl.value = null;
        //     }
        // }

        reader.readAsDataURL(file);
    }
}


function handleImg(img, toWidth, toHeight) {
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    canvas.width = toWidth;
    canvas.height = toHeight;
    ctx.drawImage(img, 0, 0, toWidth, toHeight);
    img.onload = function() {
        img.width = toWidth;
        img.height = toHeight;
        users[myUserID].emoji = null;
        users[myUserID].img = img;
        console.log("Image loaded: ", img.src);
        redrawCanvas();
        if (isSocketOpen()) {
            postImage(myUserID, img);
        }
        allLoadedImgs.push(img);
        fileEl.value = null;
    }
    img.src = canvas.toDataURL();
}


    

function connectMicroClicked(event) {
    if (microbitConnected) {
        if (disconnectMicrobit()) {
            connectMicroButton.textContent = "Tilslut micro:bit";
            microbitConnected = false;
            redrawCanvas();
            if (isSocketOpen()) {
                postDrawOnServer(myUserID, false);
            }
        }
    } else {
        connectToMicrobit(() => {
            connectMicroButton.textContent = "Afbryd micro:bit";
            microbitConnected = true;
            if (isSocketOpen() && onServer) {
                postDrawOnServer(myUserID, true);
            }
        });
            
    }
}


function connectToServerClicked(event) {
    if (onServer) {
        connectServerButton.textContent = "Tilslut server";
        onServer = false;
        onClientStuff.style.display = "block";
        // onClientStuff.style.opacity = 1;
        // ternCheckbox.removeAttribute("disabled");

        redrawCanvas();
        if (isSocketOpen()) {
            postDrawOnServer(myUserID, false);
        }
    } else {
        if (!isSocketOpen()) {
            connectServerButton.textContent = "Forbinder...";
            connectServerButton.setAttribute("disabled", "true");
            connectToServer(onSuccessfulServerConnect);
        } else {
            onSuccessfulServerConnect()
        }
    }
}

function onSuccessfulServerConnect() {
    connectServerButton.textContent = "Afbryd server";
    onClientStuff.style.display = "none";
    // onClientStuff.style.opacity = 0;
    // ternCheckbox.setAttribute("disabled", "true");

    connectServerButton.removeAttribute("disabled");
    onServer = true;
    redrawCanvas();
    postDrawOnServer(myUserID, true);
    postColor(myUserID, colorPicker.value);
    postDrawTail(myUserID, haleCheckbox.checked);
    if (users[myUserID].emoji !== null) {
        postEmoji(myUserID, users[myUserID].emoji);
    }
    if (users[myUserID].img !== null) {
        postImage(myUserID, users[myUserID].img);
    }
}


