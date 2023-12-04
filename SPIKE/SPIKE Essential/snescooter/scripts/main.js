

let forward          = document.getElementById("forward");
let backwards        = document.getElementById("backwards");
let left             = document.getElementById("left");
let right            = document.getElementById("right");
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

let motorA, motorB;
let motorAspeed = 50, motorBspeed = 50;
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

    motorA = await hub.waitForDeviceAtPort("A"); // Make sure a motor is plugged into port A
    motorB = await hub.waitForDeviceAtPort("B"); // Make sure a motor is plugged into port B

});

const scan = function () {
    if (PoweredUP.isWebBluetooth) {
        poweredUP.scan(); // Start scanning for hubs
    } else {
        alert("Your browser does not support the Web Bluetooth specification.");
    }
}

forward.onclick = function() {
    forward.setAttribute("src","images/fremOn.png")
    backwards.setAttribute("src","images/bak.png")
    left.setAttribute("src","images/venstre.png")
    right.setAttribute("src","images/højre.png")
    motorAspeed = - Math.abs(motorAspeed);
    motorBspeed = Math.abs(motorBspeed);
    motorA.setPower(motorAspeed);
    motorB.setPower(motorBspeed);
    motorOn = true;
}

backwards.onclick = function() {
    backwards.setAttribute("src","images/bakOn.png")
    forward.setAttribute("src","images/frem.png")
    left.setAttribute("src","images/venstre.png")
    right.setAttribute("src","images/højre.png")
    motorAspeed = Math.abs(motorAspeed);
    motorBspeed = - Math.abs(motorBspeed);
    motorA.setPower(motorAspeed);
    motorB.setPower(motorBspeed);
    motorOn = true;
}


left.onclick = function() {
    left.setAttribute("src","images/venstreOn.png")
    backwards.setAttribute("src","images/bak.png")
    forward.setAttribute("src","images/frem.png")
    right.setAttribute("src","images/højre.png")
    motorAspeed = Math.abs(motorAspeed);
    motorBspeed = Math.abs(motorBspeed);
    motorA.setPower(motorAspeed);
    motorB.setPower(motorBspeed);
    motorOn = true;
}

right.onclick = function() {
    right.setAttribute("src","images/højreOn.png")
    backwards.setAttribute("src","images/bak.png")
    forward.setAttribute("src","images/frem.png")
    left.setAttribute("src","images/venstre.png")
    motorAspeed = - Math.abs(motorAspeed);
    motorBspeed = - Math.abs(motorBspeed);
    motorA.setPower(motorAspeed);
    motorB.setPower(motorBspeed);
    motorOn = true;
}

stop.onclick = function() {
    forward.setAttribute("src","images/frem.png")
    backwards.setAttribute("src","images/bak.png")
    left.setAttribute("src","images/venstre.png")
    right.setAttribute("src","images/højre.png")
    motorA.brake();
    motorB.brake();
    motorOn = false;
}

speed25.onclick = function() {
    speed.setAttribute("src","images/hastighed25.png")
    speed25.setAttribute("src","images/speed25On.png")
    speed50.setAttribute("src","images/speed50.png")
    speed75.setAttribute("src","images/speed75.png")
    speed100.setAttribute("src","images/speed100.png")
    motorAspeed=(motorAspeed > 0)? 25 : -25;
    motorBspeed=(motorBspeed > 0)? 25 : -25;
    if (motorOn) { motorA.setPower(motorAspeed); motorB.setPower(motorBspeed);}
}

speed50.onclick = function() {
    speed.setAttribute("src","images/hastighed50.png")
    speed50.setAttribute("src","images/speed50On.png")
    speed25.setAttribute("src","images/speed25.png")
    speed75.setAttribute("src","images/speed75.png")
    speed100.setAttribute("src","images/speed100.png")
    motorAspeed=(motorAspeed > 0)? 50 : -50;
    motorBspeed=(motorBspeed > 0)? 50 : -50;
    if (motorOn) { motorA.setPower(motorAspeed); motorB.setPower(motorBspeed);}
}

speed75.onclick = function() {
    speed.setAttribute("src","images/hastighed75.png")
    speed75.setAttribute("src","images/speed75On.png")
    speed25.setAttribute("src","images/speed25.png")
    speed50.setAttribute("src","images/speed50.png")
    speed100.setAttribute("src","images/speed100.png")
    motorAspeed=(motorAspeed > 0)? 75 : -75;
    motorBspeed=(motorBspeed > 0)? 75 : -75;
    if (motorOn) { motorA.setPower(motorAspeed); motorB.setPower(motorBspeed);}
}

speed100.onclick = function() {
    speed.setAttribute("src","images/hastighed100.png")
    speed100.setAttribute("src","images/speed100On.png")
    speed25.setAttribute("src","images/speed25.png")
    speed50.setAttribute("src","images/speed50.png")
    speed75.setAttribute("src","images/speed75.png")
    motorAspeed=(motorAspeed > 0)? 100 : -100;
    motorBspeed=(motorBspeed > 0)? 100 : -100;
    if (motorOn) { motorA.setPower(motorAspeed); motorB.setPower(motorBspeed);}
}

connectHub.onclick  = function() {
    scan();
}

connectText.onclick  = function() {
    connectedHub.disconnect();
}
