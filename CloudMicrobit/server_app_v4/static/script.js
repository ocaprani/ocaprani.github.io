let canvas = document.querySelector("#canvas");
let context = canvas.getContext('2d');

let saveData = {};
let colors = ["red", "blue", "green", "yellow", "purple"];

// create a new WebSocket connection
// var socket = new WebSocket('ws://127.0.0.1:8080');
// var socket = new WebSocket('ws://0.0.0.0:8080');
// var socket = new WebSocket('ws://172.17.0.2:8080');
// var socket = new WebSocket('ws://192.168.1.166:8080');
var socket = new WebSocket('wss://cloudmicrobit.azurewebsites.net');


// callback function for when the WebSocket connection is opened
socket.onopen = function(event) {
    console.log("Connected to server");
    socket.send('server');
};

// callback function for when the socket receives a message
socket.onmessage = function(event) {
    // console.log("Received: " + event.data);
    let jsonData = JSON.parse(event.data);
    
    if (!(jsonData.userID in users)) {
        let userColor;
        if ("color" in jsonData) {
            userColor = jsonData.color;
        }
        else {
            userColor = colors[jsonData.userID.charCodeAt(0) % colors.length];
        }
        addUser(jsonData.userID, userColor, []);
    }

    let fromUser = users[jsonData.userID];
    
    if ("color" in jsonData) {
        console.log("Received color: ", jsonData.color);
        fromUser.color = jsonData.color;
        redrawCanvas();
    } else if ("coords" in jsonData) {
        addDataToUser(jsonData.userID, {x: jsonData["coords"]["x"], y: jsonData["coords"]["y"]}, jsonData["t"]);
    } else if ("img" in jsonData) {
        console.log("Received image");
        fromUser.emoji = null;
        if (jsonData.img === null) {
            fromUser.img = null;
            redrawCanvas();
            return;
        } else {
            let img = new Image();
            img.src = jsonData.img;
            img.onload = function() {
                fromUser.img = img;
                redrawCanvas();
            };
        }
        
    } else if ("emoji" in jsonData) {
        console.log("Received emoji: ", jsonData.emoji);
        fromUser.img = null;
        fromUser.emoji = jsonData.emoji;
        redrawCanvas();
    } else if ("draw" in jsonData) {
        console.log("Received draw mode: ", jsonData.draw);
        if (jsonData.draw === false) {
            fromUser.coords = [];
            fromUser.indexOfHead = 0;
            redrawCanvas();
        }
    } else if ("drawTail" in jsonData) {
        console.log("Received draw tail: ", jsonData.drawTail);
        fromUser.drawTail = jsonData.drawTail;
        redrawCanvas();
    } else if ("close" in jsonData && jsonData.close === true) {
        console.log("Received close connection");
        removeUser(jsonData.userID);
    } else {
        console.error("Unknown message type");
    }
};

// callback function for when the WebSocket connection is closed
socket.onclose = function (event) {
    console.log('WebSocket connection closed');
};

// callback function for when there is an error with the WebSocket connection
socket.onerror = function (event) {
    console.error('WebSocket error:', event);
};


// callback function for when the window is closed
window.onbeforeunload = function() {
    socket.close();
};


// Download canvas as an image
function saveCanvasImg() {
    console.log("Saving canvas image");
    let link = document.createElement('a');
    link.download = 'canvas.png';
    link.href = canvas.toDataURL();
    link.click();
}


function redrawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let userID in users) {
        let user = users[userID];

        if (user.drawTail) {
            drawTail(user);
        }
        drawFigure(user);
    }

}