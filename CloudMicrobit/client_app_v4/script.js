


let canvas = document.querySelector("#canvas");
console.log("CANVAS", canvas)
let context = canvas.getContext('2d');
context.fillStyle  = "white";

connectButton.onclick = connectClicked;

let dropdown = document.getElementById("dropdown");
dropdown.value = "0";
dropdown.onchange = changeMode;

let dropdownEmoji = document.getElementById("dropdown-emoji");
dropdownEmoji.value = "0";
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
addUser(myUserID, userColor);
addDataToUser(myUserID, {x: canvas.width / 2, y: canvas.height / 2}, 20)

changeMode();
changeEmoji();
connectToServer();



// remove empty option from dropdown when opened
// dropdownEmoji.onclick = function() {
//     if (dropdownEmoji.options[dropdownEmoji.options.length - 1].value === "") {
//         dropdownEmoji.remove(dropdownEmoji.options.length - 1);
//     }
// }



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

    if (socket !== null && socket.readyState === 1 && dropdown.value === "2") {
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
        drawFigure(users[myUserID]);
    }

}



// Callback when the dropdown changes
function changeMode(event) {
    let value = dropdown.value;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    redrawCanvas();

    if (socket !== null && socket.readyState === 1) {
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
    //     load_img(event);
    // }

    if (dropdownEmoji.options[dropdownEmoji.options.length - 1].value === "") {
        dropdownEmoji.remove(dropdownEmoji.options.length - 1);
    }

    let emoji = dropdownEmoji.options[dropdownEmoji.selectedIndex].text;
    users[myUserID].emoji = emoji;
    users[myUserID].img = null;

    redrawCanvas();

    fileEl.value = null;

    if (socket !== null && socket.readyState === 1) {
        postEmoji(myUserID, emoji);
    }
}




function drawHead(user, size=10) {
    if (user.coords.length < 1) {
        return;
    }
    let coords = user.coords[user.indexOfHead];
    context.fillStyle = user.color;
    context.beginPath();
    context.arc(coords.x, coords.y, size, 0, 2 * Math.PI);
    context.fill();
}


function drawTail(user) {
    if (user.coords.length < maxTailLength) {
        return;
    }
    context.fillStyle = user.color;
    context.strokeStyle = user.color;
    let prevCoords = user.coords[(user.indexOfHead+1) % user.coords.length];
    for (let i = 1; i < user.coords.length; i++) {
        let coords = user.coords[(i + user.indexOfHead + 1) % user.coords.length];
        context.lineWidth = tailWidth * ((i / user.coords.length));
        
        // draw circle at joint with diameter of lineWidth
        context.beginPath();
        context.arc(coords.x, coords.y, context.lineWidth / 2, 0, 2 * Math.PI);
        context.fill();
        
        context.beginPath();
        context.moveTo(prevCoords.x, prevCoords.y);
        context.lineTo(coords.x, coords.y);
        context.stroke();
        context.closePath();
        prevCoords = coords;
    }

}


function load_img(event) {
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

