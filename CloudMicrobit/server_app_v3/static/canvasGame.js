/* 
    This file is used to handle the canvas game
    every user has a dot, with a tail behind it.
    It moves around the canvas using the xy coordinates
    the functions are called with.
*/


// let canvas = document.querySelector("#canvas");
// let context = canvas.getContext('2d');

// map of userID to user object which contain color and list of x,y coordinates
let users = {};

let maxTailLength = 8;
let tailWidth = 10;


function addUser(userID, color, coords) {
    // add if not already in users
    if (userID in users) {
        return;
    }
    users[userID] = {
        color: color,
        coords: coords,
        indexOfHead: 0
    };
    redrawCanvas();
}

function removeUser(userID) {
    delete users[userID];
    redrawCanvas();
}

function updateUser(userID, coords) {
    users[userID].coords = coords;
    redrawCanvas();
}

function addCoord(userID, coords) {
    let user = users[userID];
    if (user.coords.length < maxTailLength) {
        user.coords.push(coords);
    } else {
        user.indexOfHead = (user.indexOfHead + 1) % user.coords.length;
        user.coords[user.indexOfHead] = coords;
    }

    redrawCanvas();
}

function redrawCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let userID in users) {
        let user = users[userID];
        drawHead(user);
        drawTail(user);
    }
}


function drawHead(user) {
    if (user.coords.length < 1) {
        return;
    }
    let coords = user.coords[user.indexOfHead];
    context.fillStyle = user.color;
    context.beginPath();
    context.arc(coords.x, coords.y, 10, 0, 2 * Math.PI);
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


