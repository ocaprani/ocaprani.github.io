
let canvas = document.querySelector("#canvas");
let context = canvas.getContext('2d');

let saveData = {};
let colors = ["red", "blue", "green", "yellow", "purple"];

var socket = io();
socket.on('connect', function() {
    socket.send('server');
    // socket.emit('my event', {data: 'I\'m connected!'});
    // addUser("microbit", "red", []);
});

// callback function for when the socket receives a message
socket.on('some_event', function(msg) {
    saveData = msg.data;
    console.log("Received: " + msg.data);
    console.log("Received: " + msg.data.coords);

    let jsonData = JSON.parse(msg.data);

    // draw color based on first letter of userID
    let userColor = colors[jsonData.userID.charCodeAt(0) % colors.length];
    // let userColor = colors[Math.floor(Math.random() * colors.length)];
    addUser(jsonData.userID, userColor, []);

    addCoord(jsonData.userID, {x: jsonData["coords"]["x"], y: jsonData["coords"]["y"]});

});