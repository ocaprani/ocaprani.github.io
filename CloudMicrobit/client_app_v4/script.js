


let canvas = document.querySelector("#canvas");
// console.log("CANVAS", canvas)
let context = canvas.getContext('2d');
// let canvasColor = canvas.style.backgroundColor;

tempText = document.getElementById("temp");

let microbitConnected = false;
connectMicroButton.onclick = connectMicroClicked;

let connectServerButton = document.getElementById("connectServerButton");
connectServerButton.onclick = connectToServerClicked;

let serverStuffDiv = document.getElementById("onSeverStuff");

// let dropdown = document.getElementById("dropdown");
// dropdown.value = "0";
// dropdown.onchange = changeMode;

let dropdownEmoji = document.getElementById("dropdown-emoji");
dropdownEmoji.value = "default";
dropdownEmoji.onchange = changeEmoji;

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
    x = (canvas.width / 2) + (x / 1000) * canvas.width/2;
    y = (canvas.height / 2) - (y / 1000) * canvas.height/2;
    x = Math.round(x);
    y = Math.round(y);
    console.log(x,y);

    addDataToUser(myUserID, {x: x, y: y}, temperature);
    updateTextbox(temperature);

    if (isSocketOpen() && onServer) {
      postCoordinates(myUserID, {x: x, y: y}, temperature);
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
    
    if (onServer) {
        if (haleCheckbox.checked) {
            drawTail(myUser);
        }
        drawFigure(myUser);
    } else {
        if (ternCheckbox.checked) {
            let coords = getCurrentUserCoords(myUser);
            drawGrid(coords.x, coords.y);
        }
        if (haleCheckbox.checked) {
            drawTail(myUser);
        }
        drawHead(myUser);
    }
}


function updateTextbox(temperature) {
    tempText.textContent = `Temperatur: ${temperature.toFixed(0)}°C`;
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
    
    // let value = dropdown.value;
    // if chosen value is the last in the list, load an image
    // if (value === dropdownEmoji.options[dropdownEmoji.options.length - 1].value) {
    //     loadImg(event);
    // }

    if (dropdownEmoji.options[dropdownEmoji.options.length - 1].value === "") {
        dropdownEmoji.remove(dropdownEmoji.options.length - 1);
    }

    let emoji;
    if (dropdownEmoji.value === "default") {
        emoji = null;
    }
    else {
        emoji = dropdownEmoji.options[dropdownEmoji.selectedIndex].text;
    }

    users[myUserID].emoji = emoji;
    users[myUserID].img = null;

    redrawCanvas();

    fileEl.value = null;

    if (isSocketOpen()) {
        postEmoji(myUserID, emoji);
    }
}




function loadImg(event) {
    users[myUserID].emoji = null;
    
    // Add empty option to dropdown
    // if (dropdownEmoji.options[dropdownEmoji.options.length - 1].value !== "") {
        // let option = document.createElement("option");
        // option.text = "";
        // option.value = "";
        // dropdownEmoji.value = "";
        // dropdownEmoji.add(option);
        
        // Set to filename
    // }

    var file = event.target.files[0];
    
    let option = document.createElement("option");
    option.style.display = "none";
    // Cut off and add dots if too long
    let fileName = file.name;
    let maxNameLength = 10;
    if (fileName.length > maxNameLength) {
        fileName = fileName.substring(0, maxNameLength - 3) + "...";
    }
    option.text = fileName;
    option.value = "";
    dropdownEmoji.add(option);
    dropdownEmoji.value = "";


    if (file.type == "image/png" || file.type == "image/jpeg") {
        console.log("Image file selected:", file.name);
        var reader = new FileReader();
        reader.onload = function (event) {
            console.log("Image loaded");
            var img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                users[myUserID].img = img;
                users[myUserID].emoji = null;
                redrawCanvas();
                postImage(myUserID, img);
            }
        }
        reader.readAsDataURL(file);
    }
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
        serverStuffDiv.style.display = "none";
        ternCheckbox.parentElement.style.display = "block";
        redrawCanvas();
        if (isSocketOpen()) {
            postDrawOnServer(myUserID, false);
        }
    } else {
        if (!isSocketOpen()) {
            connectServerButton.textContent = "Forbinder...";
            connectServerButton.setAttribute("disabled", "true");
            connectToServer(() => {
                connectServerButton.textContent = "Afbryd server";
                serverStuffDiv.style.display = "block";
                ternCheckbox.parentElement.style.display = "none";
                onServer = true;
                connectServerButton.removeAttribute("disabled");
                redrawCanvas();
                postDrawOnServer(myUserID, true);
                postColor(myUserID, colorPicker.value);
                postDrawTail(myUserID, haleCheckbox.checked);
                // postEmoji(myUserID, users[myUserID].emoji);
            });
        } else {
            connectServerButton.textContent = "Afbryd server";
            serverStuffDiv.style.display = "block";
            ternCheckbox.parentElement.style.display = "none";
            onServer = true;
            redrawCanvas();
        }
    }
}


