

// map of userID to user object which contain color and list of x,y coordinates
let users = {};

let maxTailLength = 10;
// let tailWidth = 8;

let defaultSize = {w: 30, h: 30};
let lightRange = {low: 0, high: 100};
let tempRange = {low: 25, high: 30};
let figSizeRange = {widthLow: 15, heightLow: 15, widthHigh: 80, heightHigh: 80};

let figSizeMult = 1.2;


function addUser(userID, color) {
    // add if not already in users
    if (userID in users) {
        return;
    }

    users[userID] = {
        color: color,
        coords: [],
        indexOfHead: 0,
        // temperature: 0,
        // light: 0,
        size: defaultSize,
        drawTail: false,
        img: null,
        emoji: null
    };
}


function removeUser(userID) {
    delete users[userID];
    redrawCanvas();
}


function updateUser(userID, coords) {
    users[userID].coords = coords;
    redrawCanvas();
}


function addDataToUser(userID, coords, size) {
    let user = users[userID];
    if (user.coords.length < maxTailLength) {
        user.coords.push(coords);
    } else {
        user.indexOfHead = (user.indexOfHead + 1) % user.coords.length;
        user.coords[user.indexOfHead] = coords;
    }
    // user.temperature = temperature;
    // user.light = light;
    user.size = size;

    redrawCanvas();
}




function drawHead(user) {
    let size = user.size["w"] / 2;
    if (user.coords.length < 1) {
        return;
    }
    let coords = getCurrentUserCoords(user);
    context.fillStyle = user.color;
    context.beginPath();
    context.arc(coords.x, coords.y, size, 0, 2 * Math.PI);
    context.fill();
}


function drawTail(user) {
    // if (user.coords.length < maxTailLength) {
    //     return;
    // }

    userSize = user.size["w"];
    context.fillStyle = user.color;
    context.strokeStyle = user.color;
    let prevCoords = user.coords[(user.indexOfHead+1) % user.coords.length];
    for (let i = 1; i < user.coords.length; i++) {
        let coords = user.coords[(i + user.indexOfHead + 1) % user.coords.length];
        // context.lineWidth = tailWidth * ((i / user.coords.length));
        context.lineWidth = userSize * ((i / user.coords.length)) * 0.8;
        
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




function getScaleFromLight(lightlevel) {
    // Scale image based on temperature
    let scale = (lightlevel - lightRange.low) / (lightRange.high - lightRange.low);
    let width = figSizeRange.widthLow + scale * (figSizeRange.widthHigh - figSizeRange.widthLow);
    let height = figSizeRange.heightLow + scale * (figSizeRange.heightHigh - figSizeRange.heightLow);
    return {w: width, h: height};
}

function getScaleFromTemp(temperature) {
    // Scale image based on temperature
    let scale = (temperature - tempRange.low) / (tempRange.high - tempRange.low);
    let width = figSizeRange.widthLow + scale * (figSizeRange.widthHigh - figSizeRange.widthLow);
    let height = figSizeRange.heightLow + scale * (figSizeRange.heightHigh - figSizeRange.heightLow);
    return {w: width, h: height};
}


function drawFigure(user) {
    if (user.coords.length < 1) {
        return;
    }

    if (user.img !== null) {
        drawImage(user);
    } else if (user.emoji !== null) {
        drawEmoji(user);
    } else {
        drawHead(user);
    }
}


function drawEmoji(user) {
    // Draw emoji at head
    let coords =  getCurrentUserCoords(user);
    let userSize = user.size;
    let scaleWidth = userSize["w"] * figSizeMult;
    let scaleHeight = userSize["h"] * figSizeMult;
    let emoji = user.emoji;
    if (emoji !== null) {
        emoji.width = scaleWidth;
        emoji.height = scaleHeight;
        // Draw emoji centered at head (as text)
        context.font = `${scaleWidth}px Arial`;
        context.fillText(emoji, coords.x - scaleWidth / 1.5, coords.y + scaleHeight / 2.9);
        // context.fillText(emoji, coords.x, coords.y);
    } else {
        console.log("Error: No emoji selected");
    }
}


function drawImage(user) {
    // Draw image at head
    let coords =  getCurrentUserCoords(user);
    let img = user.img;
    let userSize = user.size;
    let scaleWidth = userSize["w"] * figSizeMult;
    let scaleHeight = userSize["h"] * figSizeMult;
    if (img !== null) {
        img.width = scaleWidth;
        img.height = scaleHeight;
        // Draw img as circle
        context.save();
        context.beginPath();
        context.arc(coords.x, coords.y, scaleWidth / 2, 0, 2 * Math.PI);
        context.closePath();
        context.clip();
        context.drawImage(img, coords.x - scaleWidth / 2, coords.y - scaleHeight / 2, scaleWidth, scaleHeight);
        context.restore();
    } else {
        drawHead(user);
    }
}

function getCurrentUserCoords(user) {
    return user.coords[user.indexOfHead];
}



