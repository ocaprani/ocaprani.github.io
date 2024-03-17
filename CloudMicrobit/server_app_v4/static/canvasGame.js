

// map of userID to user object which contain color and list of x,y coordinates
let users = {};

let maxTailLength = 8;
let tailWidth = 10;


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
        img: null
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




