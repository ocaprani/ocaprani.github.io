/**
 * Connects to a Bluetooth device micro:bit.
 */

var bluetoothDevice;

/**
 * Object containing the Bluetooth UUIDs of all the services and
 * characteristics of the micro:bit.
 */
microbitUuid = {
    /**
     * Services
     */
    genericAccess:                              ["00001800-0000-1000-8000-00805f9b34fb", "Generic Access"],
    genericAttribute:                           ["00001801-0000-1000-8000-00805f9b34fb", "Generic Attribute"],
    deviceInformation:                          ["0000180a-0000-1000-8000-00805f9b34fb", "Device Information"],
    accelerometerService:                       ["e95d0753-251d-470a-a062-fa1922dfa9a8", "Accelerometer Service"],
    magnetometerService:                        ["e95df2d8-251d-470a-a062-fa1922dfa9a8", "Magnetometer Service"],
    buttonService:                              ["e95d9882-251d-470a-a062-fa1922dfa9a8", "Button Service"],
    ioPinService:                               ["e95d127b-251d-470a-a062-fa1922dfa9a8", "IO Pin Service"],
    ledService:                                 ["e95dd91d-251d-470a-a062-fa1922dfa9a8", "LED Service"],
    eventService:                               ["e95d93af-251d-470a-a062-fa1922dfa9a8", "Event Service"],
    dfuControlService:                          ["e95d93b0-251d-470a-a062-fa1922dfa9a8", "DFU Control Service"],
    temperatureService:                         ["e95d6100-251d-470a-a062-fa1922dfa9a8", "Temperature Service"],
    uartService:                                ["6e400001-b5a3-f393-e0a9-e50e24dcca9e", "UART Service"],
    /**
     * Characteristics
     */
    deviceName:                                 ["00002a00-0000-1000-8000-00805f9b34fb", "Device Name"],
    appearance:                                 ["00002a01-0000-1000-8000-00805f9b34fb", "Appearance"],
    peripheralPreferredConnectionParameters:    ["00002a04-0000-1000-8000-00805f9b34fb", "Peripheral Preferred Connection Parameters"],
    serviceChanged:                             ["00002a05-0000-1000-8000-00805f9b34fb", "Service Changed"],
    modelNumberString:                          ["00002a24-0000-1000-8000-00805f9b34fb", "Model Number String"],
    serialNumberString:                         ["00002a25-0000-1000-8000-00805f9b34fb", "Serial Number String"],
    hardwareRevisionString:                     ["00002a27-0000-1000-8000-00805f9b34fb", "Hardware Revision String"],
    firmwareRevisionString:                     ["00002a26-0000-1000-8000-00805f9b34fb", "Firmware Revision String"],
    manufacturerNameString:                     ["00002a29-0000-1000-8000-00805f9b34fb", "Manufacturer Name String"],
    accelerometerData:                          ["e95dca4b-251d-470a-a062-fa1922dfa9a8", "Accelerometer Data"],
    accelerometerPeriod:                        ["e95dfb24-251d-470a-a062-fa1922dfa9a8", "Accelerometer Period"],
    magnetometerData:                           ["e95dfb11-251d-470a-a062-fa1922dfa9a8", "Magnetometer Data"],
    magnetometerPeriod:                         ["e95d386c-251d-470a-a062-fa1922dfa9a8", "Magnetometer Period"],
    magnetometerBearing:                        ["e95d9715-251d-470a-a062-fa1922dfa9a8", "Magnetometer Bearing"],
    magnetometerCalibration:                    ["e95db358-251d-470a-a062-fa1922dfa9a8", "Magnetometer Calibration"],
    buttonAState:                               ["e95dda90-251d-470a-a062-fa1922dfa9a8", "Button A State"],
    buttonBState:                               ["e95dda91-251d-470a-a062-fa1922dfa9a8", "Button B State"],
    pinData:                                    ["e95d8d00-251d-470a-a062-fa1922dfa9a8", "Pin Data"],
    pinADConfiguration:                         ["e95d5899-251d-470a-a062-fa1922dfa9a8", "Pin AD Configuration"],
    pinIOConfiguration:                         ["e95db9fe-251d-470a-a062-fa1922dfa9a8", "Pin IO Configuration"],
    pwmControl:                                 ["e95dd822-251d-470a-a062-fa1922dfa9a8", "PWM Control"],
    ledMatrixState:                             ["e95d7b77-251d-470a-a062-fa1922dfa9a8", "LED Matrix State"],
    ledText:                                    ["e95d93ee-251d-470a-a062-fa1922dfa9a8", "LED Text"],
    scrollingDelay:                             ["e95d0d2d-251d-470a-a062-fa1922dfa9a8", "Scrolling Delay"],
    microbitRequirements:                       ["e95db84c-251d-470a-a062-fa1922dfa9a8", "MicroBit Requirements"],
    microbitEvent:                              ["e95d9775-251d-470a-a062-fa1922dfa9a8", "MicroBit Event"],
    clientRequirements:                         ["e95d23c4-251d-470a-a062-fa1922dfa9a8", "Client Requirements"],
    clientEvent:                                ["e95d5404-251d-470a-a062-fa1922dfa9a8", "Client Event"],
    dfuControl:                                 ["e95d93b1-251d-470a-a062-fa1922dfa9a8", "DFU Control"],
    temperature:                                ["e95d9250-251d-470a-a062-fa1922dfa9a8", "Temperature"],
    temperaturePeriod:                          ["e95d1b25-251d-470a-a062-fa1922dfa9a8", "Temperature Period"],
    txCharacteristic:                           ["6e400002-b5a3-f393-e0a9-e50e24dcca9e", "Tx Characteristic"],
    rxCharacteristic:                           ["6e400003-b5a3-f393-e0a9-e50e24dcca9e", "Rx Characteristic"],
    /**
     * Method that searches an UUID among the UUIDs of all the services and
     * characteristics and returns:
     * - in HTML blue color the name of the service/characteristic found.
     * - in HTML red color a message if the UUID has not been found.
     * @param uuid The service or characteristic UUID.
     * @param serviceOrCharacteristic True (or 1) if it is a service, and false
     * (or 0) if it is a characteristic.
     */
    searchUuid(uuid, serviceOrCharacteristic) {
        for (const key in microbitUuid) {
            if (uuid === microbitUuid[key][0]) {
                return "<font color='blue'>" + microbitUuid[key][1] + "</font>";
            }
        }
        if (serviceOrCharacteristic) {
            return "<font color='red'>Unknown Micro:Bit Service</font>";
        } else {
            return "<font color='red'>Unknown Micro:Bit Characteristic</font>";
        }
    },
}



/**
 * Function that adds string to the log.
 * @param string String to print to the log.
 */
function addLog(string) {
    console.log(string)
}

var txCharacteristic;
var rxCharacteristic;

/**
 * Function that updates the HTML element according to the UART characteristic.
 */
function readTx(event) {
    //addLog("Reading TX... ");
   /* if (!("TextDecoder") in window) {
        addLogError("Sorry, this browser does not support TextDecoder...");
    } else {
        let enc = new TextDecoder("utf-8");
        document.getElementById("tx").innerHTML += enc.decode(event.target.value) + "<br>";
        //addLog("<font color='green'>OK</font>", true);
    };*/
}

/**
 * Function that updates the RX using the corresponding micro:bit Bluetooth
 * characteristic.
 */
function writeRx(command) {
    addLog("Writing RX... ");
    if (!bluetoothDevice) {
        addLog("There is no device connected.");
    } else {
        if (bluetoothDevice.gatt.connected) {
            if (!rxCharacteristic) {
                addLog("There is no RX characteristic.");
            } else {
                if (!("TextEncoder" in window)) {
                    addLog("Sorry, this browser does not support TextEncoder...");
                } else {
                    let enc = new TextEncoder();
		    rxCharacteristic.writeValue(enc.encode(command + '\n'))
                    .then(_ => {
                        addLog("OK");
                    })
                    .catch(error => {
                        addLog(error);
                    });
                };
            };
        } else {
            addLog("There is no device connected.");
        };
    };
}

/**
 * Function that connects to a Bluetooth device, and saves the characteristics
 * associated with the UART service.
 */
function connect() {
    addLog("Requesting micro:bit Bluetooth devices... ");
    if (!navigator.bluetooth) {
        addLog("Bluetooth not available in this browser or computer.");
    } else {
        navigator.bluetooth.requestDevice({
            // To accept all devices, use acceptAllDevices: true and remove filters.
            filters: [{namePrefix: "BBC micro:bit"}],
            optionalServices: [microbitUuid.genericAccess[0], microbitUuid.genericAttribute[0],
			       microbitUuid.deviceInformation[0], microbitUuid.accelerometerService[0],
			       microbitUuid.magnetometerService[0], microbitUuid.buttonService[0],
			       microbitUuid.ioPinService[0], microbitUuid.ledService[0], microbitUuid.eventService[0],
			       microbitUuid.dfuControlService[0], microbitUuid.temperatureService[0], microbitUuid.uartService[0]],
        })
        .then(device => {
            addLog("OK");
            bluetoothDevice = device;
            addLog("Connecting to GATT server (name:" + device.name + ", ID: " + device.id + "... ");
            return device.gatt.connect();
        })
        .then(server => {
            addLog("OK");
            addLog("Getting UART service (UUID: " + microbitUuid.uartService[0] + ")... ");
            return server.getPrimaryService(microbitUuid.uartService[0]);
        })
        .then(service => {
            addLog("OK");
            addLog("Getting TX characteristic... ");
            service.getCharacteristic(microbitUuid.txCharacteristic[0])
            .then(txChar => {
                addLog("OK");
                txCharacteristic = txChar;
                addLog("Starting TX notifications... ");
                return txChar.startNotifications()
                .then(_ => {
                    txChar.addEventListener('characteristicvaluechanged', readTx);
                    addLog("OK");
                    addLog("Getting RX characteristic... ");
                    service.getCharacteristic(microbitUuid.rxCharacteristic[0])
                    .then(rxChar => {
                        rxCharacteristic = rxChar;
                        addLog("OK");
                    })
                    .catch(error => {
                        addLog(error);
                    });
                })
                .catch(error => {
                    addLog(error);
                });
            })
            .catch(error => {
                addLog(error);
            });
        })
        .catch(error => {
            addLog(error);
        });
    };
}



/**
 * Function that disconnects from the Bluetooth device (if connected).
 */
function disconnect() {
    addLog("Disconnecting... ");
    if (!bluetoothDevice) {
        addLog("There is no device connected.");
    } else {
        if (bluetoothDevice.gatt.connected) {
            bluetoothDevice.gatt.disconnect();
            if (!bluetoothDevice.gatt.connected) {
                addLog("OK");
            }
        } else {
            addLog("There is no device connected.");
        };
    };
}


let forward          = document.getElementById("forward");
let backwards        = document.getElementById("backwards");
let left             = document.getElementById("left");
let right            = document.getElementById("right");
let stop             = document.getElementById("stop");

forward.onclick = function() {
    // Command to robot
    writeRx('1')
    
    forward.setAttribute("src","images/fremOn.png")
    backwards.setAttribute("src","images/bak.png")
    left.setAttribute("src","images/venstre.png")
    right.setAttribute("src","images/højre.png")    
}

backwards.onclick = function() {
    // Command to robot
    writeRx('4')
    
    backwards.setAttribute("src","images/bakOn.png")
    forward.setAttribute("src","images/frem.png")
    left.setAttribute("src","images/venstre.png")
    right.setAttribute("src","images/højre.png")
}


left.onclick = function() {
    // Command to robot
    writeRx('2')
    
    left.setAttribute("src","images/venstreOn.png")
    backwards.setAttribute("src","images/bak.png")
    forward.setAttribute("src","images/frem.png")
    right.setAttribute("src","images/højre.png")
}

right.onclick = function() {
    // Command to robot
    writeRx('3')
    
    right.setAttribute("src","images/højreOn.png")
    backwards.setAttribute("src","images/bak.png")
    forward.setAttribute("src","images/frem.png")
    left.setAttribute("src","images/venstre.png")
}

stop.onclick = function() {
    // Command to robot
    writeRx('0')
    
    forward.setAttribute("src","images/frem.png")
    backwards.setAttribute("src","images/bak.png")
    left.setAttribute("src","images/venstre.png")
    right.setAttribute("src","images/højre.png")
}

