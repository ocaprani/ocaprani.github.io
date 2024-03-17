


let canvas = document.querySelector("#canvas");
console.log("CANVAS", canvas)
let context = canvas.getContext('2d');
context.fillStyle  = "white";

let imgSizes = {widthLow: 20, heightLow: 20, widthHigh: 150, heightHigh: 150};
let tempRange = {low: 20, high: 30};

connectButton.onclick = connectClicked;

let dropdown = document.getElementById("dropdown");
dropdown.value = "0";
dropdown.onchange = changeMode;

let socket = null;
let myUserID = String(Math.floor(Math.random() * 10000));
let userIDfield = document.getElementById("inputField");
if (userIDfield !== null) {
    userIDfield.value = myUserID;
}

let colors = ["red", "blue", "green", "yellow", "purple"];
let userColor = colors[myUserID.charCodeAt(0) % colors.length];
addUser(myUserID, userColor);
addDataToUser(myUserID, {x: canvas.width / 2, y: canvas.height / 2}, 20)

changeMode();



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
      postCoordinates(myUserID, {x: x, y: y});
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
        for (let userID in users) {
            drawImage(users[userID]);
        }
    }
    
}



// Callback when the dropdown changes
function changeMode(event) {
    let value = dropdown.value;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    redrawCanvas();
    
    // if (value === "0") {
    //     drawGrid();
    // } else if (value === "1") {
    //     console.log("Not implemented");
    // } else if (value === "2") {
    //     connectToServer();
    // }

    if (value === "2") {
        connectToServer();
    }

};




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


function getScaleFromTemp(temperature) {
    // Scale image based on temperature
    let scale = (temperature - tempRange.low) / (tempRange.high - tempRange.low);
    let width = imgSizes.widthLow + scale * (imgSizes.widthHigh - imgSizes.widthLow);
    let height = imgSizes.heightLow + scale * (imgSizes.heightHigh - imgSizes.heightLow);
    return {width: width, height: height};
}




function drawImage(user) {
    // Draw image at head
    let coords = user.coords[user.indexOfHead];
    let scale = getScaleFromTemp(user.temperature);
    let img = user.img;
    if (img !== null) {
        img.width = scale.width;
        img.height = scale.height;
        context.drawImage(img, coords.x - img.width / 2, coords.y - img.height / 2, img.width, img.height);
    } else {
        drawHead(user, scale.width / 2);
    }
}


function load_img(event) {
    var file = event.target.files[0];
    if (file.type == "image/png" || file.type == "image/jpeg") {
        var reader = new FileReader();
        reader.onload = function (event) {
            console.log("Image loaded");
            var img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                users[myUserID].img = img;
                redrawCanvas();
            }
        }
        reader.readAsDataURL(file);
    }
}

