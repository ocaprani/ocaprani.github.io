

// map of userID to user object which contain color and list of x,y coordinates
let users = {};

let maxTailLength = 10;
let tailWidth = 12;

let tempRange = {low: 20, high: 30};
let imgSizes = {widthLow: 20, heightLow: 20, widthHigh: 150, heightHigh: 150};



function addUser(userID, color) {
    // add if not already in users
    if (userID in users) {
        return;
    }

    users[userID] = {
        color: color,
        coords: [],
        indexOfHead: 0,
        temperature: 0,
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


function addDataToUser(userID, coords, temperature) {
    let user = users[userID];
    if (user.coords.length < maxTailLength) {
        user.coords.push(coords);
    } else {
        user.indexOfHead = (user.indexOfHead + 1) % user.coords.length;
        user.coords[user.indexOfHead] = coords;
    }
    user.temperature = temperature;

    redrawCanvas();
}




function getScaleFromTemp(temperature) {
    // Scale image based on temperature
    let scale = (temperature - tempRange.low) / (tempRange.high - tempRange.low);
    let width = imgSizes.widthLow + scale * (imgSizes.widthHigh - imgSizes.widthLow);
    let height = imgSizes.heightLow + scale * (imgSizes.heightHigh - imgSizes.heightLow);
    return {width: width, height: height};
}


function drawFigure(user) {
    if (user.coords.length < 1) {
        return;
    }

    if (user.img !== null) {
        drawImage(user);
    }
    else if (user.emoji !== null) {
        drawEmoji(user);
    }
    else {
        console.log("No image or emoji selected");
    }
}


function drawEmoji(user) {
    // Draw emoji at head
    let coords = user.coords[user.indexOfHead];
    let scale = getScaleFromTemp(user.temperature);
    let emoji = user.emoji;
    if (emoji !== null) {
        emoji.width = scale.width;
        emoji.height = scale.height;
        // Draw emoji centered at head (as text)
        context.font = `${scale.width}px Arial`;
        context.fillText(emoji, coords.x - scale.width / 2, coords.y + scale.height / 2);
    } else {
        console.log("Error: No emoji selected");
    }
}


function drawImage(user) {
    // Draw image at head
    let coords = user.coords[user.indexOfHead];
    let scale = getScaleFromTemp(user.temperature);
    let img = user.img;
    if (img !== null) {
        img.width = scale.width;
        img.height = scale.height;
        // Draw img as circle
        context.save();
        context.beginPath();
        context.arc(coords.x, coords.y, scale.width / 2, 0, 2 * Math.PI);
        context.closePath();
        context.clip();
        context.drawImage(img, coords.x - scale.width / 2, coords.y - scale.height / 2, scale.width, scale.height);
        context.restore();
    } else {
        drawHead(user, scale.width / 2);
    }
}



