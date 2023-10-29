let canvas = document.querySelector("#canvas");
let context = canvas.getContext('2d');

let saveData = {};
let colors = ["red", "blue", "green", "yellow", "purple"];

// create a new WebSocket connection
// var socket = new WebSocket('ws://127.0.0.1:8080');
// var socket = new WebSocket('ws://0.0.0.0:8080');
// var socket = new WebSocket('ws://172.17.0.2:8080');
// var socket = new WebSocket('ws://192.168.1.166:8080');
var socket = new WebSocket('ws://cloudmicrobit.azurewebsites.net');

    
// callback function for when the WebSocket connection is opened
socket.onopen = function(event) {
    console.log("Connected to server");
    socket.send('server');
};

// callback function for when the socket receives a message
socket.onmessage = function(event) {
    console.log("Received: " + event.data);
    // saveData = event.data;

    let jsonData = JSON.parse(event.data);
    console.log("Received: " + jsonData);

    // draw color based on first letter of userID
    let userColor = colors[jsonData.userID.charCodeAt(0) % colors.length];
    // let userColor = colors[Math.floor(Math.random() * colors.length)];
    addUser(jsonData.userID, userColor, []);

    addCoord(jsonData.userID, {x: jsonData["coords"]["x"], y: jsonData["coords"]["y"]});
};

// callback function for when the WebSocket connection is closed
socket.onclose = function (event) {
    console.log('WebSocket connection closed');
};

// callback function for when there is an error with the WebSocket connection
socket.onerror = function (event) {
    console.error('WebSocket error:', event);
};


// Download canvas as an image
function saveCanvasImg() {
    console.log("Saving canvas image");
    let link = document.createElement('a');
    link.download = 'canvas.png';
    link.href = canvas.toDataURL();
    link.click();
}