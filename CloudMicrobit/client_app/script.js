
// const server_ip = "http://127.0.0.1:5000";
const server_ip = "https://webbluetoothapp.azurewebsites.net";


let measurements = {Temperatur: [], Luftfugtighed: [], Lufttryk: [], Lydniveau: []};


let MBIT_UART_SERVICE = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
//to send TO the microbit
let MBIT_UART_RX_CHARACTERISTIC = '6E400003-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();
//to receive data FROM the microbit
let MBIT_UART_TX_CHARACTERISTIC = '6E400002-B5A3-F393-E0A9-E50E24DCCA9E'.toLowerCase();


let counter = document.getElementById('counter');
let connectButton = document.getElementById("connectButton");


function updateCounterText() {
    // set counter to total number of measurements among all types (not hardcoded)
    var total = 0;
    for (var key in measurements) {
        total += measurements[key].length;
    }
    counter.innerText = "Measurements: " + total;
}

// post measurements as json, and clear measurements
function postMeasurements() {
    console.log("Posting measurements:", measurements);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", server_ip + "/post", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(measurements));

    for (var key in measurements) {
        measurements[key] = [];
    }
    updateCounterText();
}

function addMeasurement(received) {
    timestamp = new Date().toTimeString().split(" ")[0];
    measurements["Temperatur"].push([timestamp, received[0]]);
    measurements["Luftfugtighed"].push([timestamp, received[1]]);
    measurements["Lufttryk"].push([timestamp, received[2]]);
    measurements["Lydniveau"].push([timestamp, received[3]]);
    updateCounterText();
}






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
        startReadingFromUART(ourMicrobitUART);
    }).catch(error => {
        console.log(error);
    });
}
function startReadingFromUART(mbit) {
    mbit.subscribeToMessages(handleData);
}

function handleData(message) {
    console.log(message);
    if (message === "Button A") {
        return;
    } else if (message === "Button B") {
        return;
    } else {
        addMeasurement(message.split(","));
        return;
    }
}




updateCounterText();
document.getElementById("postButton").addEventListener("click", postMeasurements);
connectButton.onclick = connectClicked;
