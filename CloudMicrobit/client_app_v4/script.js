


let canvas = document.querySelector("#canvas");
// console.log("CANVAS", canvas)
let context = canvas.getContext('2d');

coordText = document.getElementById("coord");
tempText = document.getElementById("temp");

connectButton.onclick = connectClicked;

let dropdown = document.getElementById("dropdown");
dropdown.value = "0";
dropdown.onchange = changeMode;

let dropdownEmoji = document.getElementById("dropdown-emoji");
dropdownEmoji.value = "default";
dropdownEmoji.onchange = changeEmoji;


let socket = null;
let myUserID = String(Math.floor(Math.random() * 10000));
let userIDfield = document.getElementById("inputField");
if (userIDfield !== null) {
    userIDfield.value = myUserID;
}

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

changeMode();
// changeEmoji();
connectToServer();



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
    x = (canvas.width / 2) + (x / 1024) * canvas.width;
    y = (canvas.height / 2) + (y / 1024) * canvas.height;

    addDataToUser(myUserID, {x: x, y: y}, temperature);
    updateCoordText(x, y, temperature);

    if (isSocketOpen() && dropdown.value === "2") {
      postCoordinates(myUserID, {x: x, y: y}, temperature);
    }

  }
}


function redrawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    let value = dropdown.value;
    
    if (value === "0") {
        drawGrid();
    }

    if (users[myUserID] === undefined) {
        return;
    }

    if (value === "0") {
        drawHead(users[myUserID]);
    } else if (value === "1") {
        drawHead(users[myUserID]);
        drawTail(users[myUserID]);
    } else if (value === "2") {
        drawTail(users[myUserID]);
        drawFigure(users[myUserID]);
    }

}


function updateCoordText(x, y, temperature) {
    coordText.textContent = `Koordinater: (x: ${x.toFixed(0)}, y: ${y.toFixed(0)})`;
    tempText.textContent = `Temperatur: ${temperature.toFixed(0)}°C`;
}




// Callback when the dropdown changes
function changeMode(event) {
    let value = dropdown.value;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    redrawCanvas();

    if (isSocketOpen()) {
        if (value === "2") {
            postEmoji(myUserID, users[myUserID].emoji);
        }
        postDrawOnServer(myUserID, value === "2");
    }
    
    // if (value === "0") {
    //     drawGrid();
    // } else if (value === "1") {
    //     console.log("Not implemented");
    // } else if (value === "2") {
    //     connectToServer();
    // }

    // if (value === "2") {
    //     connectToServer();
    // }

}


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
    option.text = file.name;
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



