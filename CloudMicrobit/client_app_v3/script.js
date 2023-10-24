let MBIT_UART_SERVICE = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();

//to send TO the microbit
let MBIT_UART_RX_CHARACTERISTIC = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
//to receive data FROM the microbit
let MBIT_UART_TX_CHARACTERISTIC = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();

let connectButton = document.getElementById("connectButton");

function appendToLog(moreText) {
    console.log(moreText);
}

let ourMicrobitUART;
let bluetoothSearchOptions = {
    filters: [{
            namePrefix: "BBC micro:bit",
        }],
    optionalServices: [MBIT_UART_SERVICE]
};

class MicroBitUART {
    constructor(rxCharacteristic, txCharacteristic) {
        this.messageSubscribers = [];
        this.rxCharacteristic = rxCharacteristic;
        this.txCharacteristic = txCharacteristic;
        this.decoder = new TextDecoder();
        this.txCharacteristic.startNotifications().then(characteristic => {
            characteristic.addEventListener('characteristicvaluechanged', ev => {
                let value = (event.target).value;
                let valueAsString = new TextDecoder().decode(value);
                this.handleNewMessage(valueAsString);
            });
        });
    }
    subscribeToMessages(receiver) {
        this.messageSubscribers.push(receiver);
    }
    handleNewMessage(message) {
        this.messageSubscribers.forEach(subscriber => {
            subscriber(message);
        });
    }
    send(key, value) {
        let kvstring = `${key}^${value}#`;
        let encoder = new TextEncoder('utf-8');
        let encoded = encoder.encode(kvstring);
        this.rxCharacteristic.writeValue(encoded);
        appendToLog("Sent >>>> " + kvstring);
    }
}

function connectClicked(e) {
    navigator.bluetooth.requestDevice(bluetoothSearchOptions).then(device => {
        appendToLog(`Found:  ${device.name}`);
        return device.gatt.connect();
    }).then(server => {
        appendToLog("...connected!");
        return server.getPrimaryService(MBIT_UART_SERVICE);
    }).then(service => {
        return Promise.all([service.getCharacteristic(MBIT_UART_RX_CHARACTERISTIC),
            service.getCharacteristic(MBIT_UART_TX_CHARACTERISTIC)]);
    }).then(rxandtx => {
        let rx;
        let tx;
        [rx, tx] = rxandtx;
        ourMicrobitUART = new MicroBitUART(rx, tx);
        appendToLog("Made a UART!!");

        let userColor = colors[userIDfield.value.charCodeAt(0) % colors.length];
        addUser(userIDfield.value, userColor, []);

        startReadingFromUART(ourMicrobitUART);
    }).catch(error => {
        console.log(error);
    });
}
function startReadingFromUART(mbit) {
    mbit.subscribeToMessages(handleData);
}




let canvas = document.querySelector("#canvas");
console.log("CANVAS", canvas)
let context = canvas.getContext('2d');
context.fillStyle  = "white";

let userIDfield = document.getElementById("inputField");
userIDfield.value = Math.floor(Math.random() * 10000);

let colors = ["red", "blue", "green", "yellow", "purple"];



function handleData(message) {
  if (message === "Button A") {
    return;
  } else if (message === "Button B") {
    return;
  } else {
    let data = message.split(",");
    let x = Number(data[0]);
    let y = Number(data[1]);
    x = (canvas.width / 2) + (x / 1024) * canvas.width;
    y = (canvas.height / 2) + (y / 1024) * canvas.height;

    let userID = userIDfield.value;
    addCoord(userID, {x: x, y: y});
    postCoordinates(userID, {x: x, y: y});
  }
}


connectButton.onclick = connectClicked;



function postCoordinates(userID, coords) {
    console.log("Posting coordinates: ", coords);
    socket.send(JSON.stringify({ userID: userID, coords: coords }));
}


const server_ip = "ws://127.0.0.1:8080";
// const server_ip = "ws://192.168.1.166:8080";
// const server_ip = "https://cloudmicrobit.azurewebsites.net";

var socket = new WebSocket(server_ip);


socket.onopen = function(event) {
    console.log("Connected to server");
    socket.send('client');
};


socket.onclose = function (event) {
    console.log('WebSocket connection closed');
};

// callback function for when there is an error with the WebSocket connection
socket.onerror = function (event) {
    console.error('WebSocket error:', event);
};



