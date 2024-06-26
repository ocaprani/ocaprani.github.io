

function postCoordinates(userID, coords, size) {
    // console.log("Posting coordinates: ", coords);
    // socket.send(JSON.stringify({ userID: userID, coords: coords, t: temperature, l: light}));
    socket.send(JSON.stringify({ userID: userID, coords: coords, s: size}));
}

function postImage(userID, img) {
    console.log("Posting image");
    let imgData;
    if (img === null) {
        imgData = null;
    } else {
        imgData = img.src;
    }

    socket.send(JSON.stringify({ userID: userID, img: imgData })); // img.data is a Uint8Array
}

function postEmoji(userID, emoji) {
    console.log("Posting emoji: ", emoji);
    socket.send(JSON.stringify({ userID: userID, emoji: emoji }));
}

function postDrawOnServer(userID, value) {
    console.log("Posting draw mode: ", value);
    socket.send(JSON.stringify({ userID: userID, draw: value }));
}

function postColor(userID, color) {
    console.log("Posting color: ", color);
    socket.send(JSON.stringify({ userID: userID, color: color }));
}

function postDrawTail(userID, shouldDraw) {
    console.log("Posting draw tail: ", shouldDraw);
    socket.send(JSON.stringify({ userID: userID, drawTail: shouldDraw }));
}


function postCloseConnection() {
    socket.send(JSON.stringify({ userID: myUserID, close: true }));
}


function connectToServer(onSuccess) {
    
    // const server_ip = "ws://127.0.0.1:8080";
    // const server_ip = "ws://172.17.0.2:8080";
    // const server_ip = "ws://0.0.0.0:8080";
    // const server_ip = "ws://192.168.1.166:8080";
    // const server_ip = "wss://cloudmicrobit.azurewebsites.net";
    const server_ip = "wss://cloudservermicrobit.azurewebsites.net";
    
    socket = new WebSocket(server_ip);
    
    socket.onopen = function(event) {
        console.log("Connected to server");
        socket.send('client');
        onSuccess();
    };

    socket.onmessage = function(event) {
        let jsonData = JSON.parse(event.data);
        console.log("Received: ", jsonData);
    }

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




