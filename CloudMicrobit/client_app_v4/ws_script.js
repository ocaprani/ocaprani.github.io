

function postCoordinates(userID, coords, temperature) {
    // console.log("Posting coordinates: ", coords);
    socket.send(JSON.stringify({ userID: userID, coords: coords, t: temperature }));
}


function postImage(userID, img) {
    console.log("Posting image");
    socket.send(JSON.stringify({ userID: userID, img: img.src })); // img.data is a Uint8Array
}

function postEmoji(userID, emoji) {
    console.log("Posting emoji: ", emoji);
    socket.send(JSON.stringify({ userID: userID, emoji: emoji }));
}

function postDrawOnServer(userID, value) {
    console.log("Posting draw mode: ", value);
    socket.send(JSON.stringify({ userID: userID, draw: value }));
}

function postCloseConnection() {
    socket.send(JSON.stringify({ userID: myUserID, close: true }));
}


function connectToServer() {
    
    // const server_ip = "ws://127.0.0.1:8080";
    // const server_ip = "ws://172.17.0.2:8080";
    // const server_ip = "ws://0.0.0.0:8080";
    // const server_ip = "ws://192.168.1.166:8080";
    const server_ip = "wss://cloudmicrobit.azurewebsites.net";
    
    socket = new WebSocket(server_ip);
    
    socket.onopen = function(event) {
        console.log("Connected to server");
        socket.send('client');
        postEmoji(myUserID, users[myUserID].emoji);
    };

    socket.onclose = function (event) {
        console.log('WebSocket connection closed');
    };

    // callback function for when there is an error with the WebSocket connection
    socket.onerror = function (event) {
        console.error('WebSocket error:', event);
    };

    window.onbeforeunload = function() {
        postCloseConnection();
        socket.close();
    };

}




