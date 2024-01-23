

let clockwise        = document.getElementById("clockwise");
let counterclockwise = document.getElementById("counterclockwise");
let stop             = document.getElementById("stop");

let speed            = document.getElementById("speed");
let speed25          = document.getElementById("speed25");
let speed50          = document.getElementById("speed50");
let speed75          = document.getElementById("speed75");
let speed100         = document.getElementById("speed100");

let connectHub       = document.getElementById("connectHub");
let connectText      = document.getElementById("connectText");
let hubText          = document.getElementById("hubText");

let connectedHub

let motor;
let motorspeed = 50;
let motorOn = false;

const poweredUP = new PoweredUP.PoweredUP();

poweredUP.on("discover", async (hub) => { // Wait to discover hubs

    await hub.connect(); // Connect to hub
    connectedHub = hub
    console.log(`Connected to ${hub.name}!`);
    connectHub.setAttribute("src","images/tilsluttet.png")
    connectText.setAttribute("src","images/afbryd.png")
    hubText.setAttribute("src","images/blank.png")
    
    hub.on("attach", (device) => {
        console.log(`Device ${device.typeName} attached to port ${device.portName}`) ;
	motor = device
    });

    hub.on("detach", (device) => {
        console.log(`Device ${device.typeName} detached to port ${device.portName}`) ;
    });

    hub.on("disconnect", () => {
        console.log(`Disconnected ${hub.name}`);
	connectHub.setAttribute("src","images/tilslut.png")
        connectText.setAttribute("src","images/tryk.png")
	hubText.setAttribute("src","images/hubKnap.png")
    })

    motor = await hub.waitForDeviceAtPort("A"); // Make sure a motor is plugged into port A

});

const scan = function () {
    if (PoweredUP.isWebBluetooth) {
        poweredUP.scan(); // Start scanning for hubs
    } else {
        alert("Your browser does not support the Web Bluetooth specification.");
    }
}

clockwise.onclick = function() {
    clockwise.setAttribute("src","images/medUretOn.png")
    counterclockwise.setAttribute("src","images/imodUret.png")
    motorspeed=Math.abs(motorspeed)
    motor.setPower(motorspeed);
    motorOn = true;
}

counterclockwise.onclick = function() {
    counterclockwise.setAttribute("src","images/imodUretOn.png")
    clockwise.setAttribute("src","images/medUret.png")
    motorspeed=-Math.abs(motorspeed)
    motor.setPower(motorspeed);
    motorOn = true;
}

stop.onclick = function() {
    clockwise.setAttribute("src","images/medUret.png")
    counterclockwise.setAttribute("src","images/imodUret.png")
    motor.brake();
    motorOn = false;
}

speed25.onclick = function() {
    speed.setAttribute("src","images/hastighed25.png")
    speed25.setAttribute("src","images/speed25On.png")
    speed50.setAttribute("src","images/speed50.png")
    speed75.setAttribute("src","images/speed75.png")
    speed100.setAttribute("src","images/speed100.png")
    motorspeed=(motorspeed > 0)? 25 : -25;
    if (motorOn) motor.setPower(motorspeed);
}

speed50.onclick = function() {
    speed.setAttribute("src","images/hastighed50.png")
    speed50.setAttribute("src","images/speed50On.png")
    speed25.setAttribute("src","images/speed25.png")
    speed75.setAttribute("src","images/speed75.png")
    speed100.setAttribute("src","images/speed100.png")
    motorspeed=(motorspeed > 0)? 50 : -50;
    if (motorOn) motor.setPower(motorspeed);
}

speed75.onclick = function() {
    speed.setAttribute("src","images/hastighed75.png")
    speed75.setAttribute("src","images/speed75On.png")
    speed25.setAttribute("src","images/speed25.png")
    speed50.setAttribute("src","images/speed50.png")
    speed100.setAttribute("src","images/speed100.png")
    motorspeed=(motorspeed > 0)? 75 : -75;
    if (motorOn) motor.setPower(motorspeed);
}

speed100.onclick = function() {
    speed.setAttribute("src","images/hastighed100.png")
    speed100.setAttribute("src","images/speed100On.png")
    speed25.setAttribute("src","images/speed25.png")
    speed50.setAttribute("src","images/speed50.png")
    speed75.setAttribute("src","images/speed75.png")
    motorspeed=(motorspeed > 0)? 100 : -100;
    if (motorOn) motor.setPower(motorspeed);
}

connectHub.onclick  = function() {
    scan();
}

connectText.onclick  = function() {
    connectedHub.disconnect();
}
