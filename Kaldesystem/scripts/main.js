var button1 = document.getElementById("button1");
var button2 = document.getElementById("button2");
var button3 = document.getElementById("button3");
var button4 = document.getElementById("button4");
var button5 = document.getElementById("button5");

var button6 = document.getElementById("button6");
var button7 = document.getElementById("button7");
var button8 = document.getElementById("button8");
var button9 = document.getElementById("button9");
var button10= document.getElementById("button10");


// 0 = slukket, 1 = tændt. En ekstra i starten da
// tabeller starter med index 0 og det er lettere at
// læse når index er fra 1 og 0p til 10
var buttonState = [
    0,
    0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0
]


button1.onclick = () => {
    
    if (buttonState[1] == 0) {
        console.log("tænd 1")
	button1.innerHTML = "Sluk";
	buttonState[1] = 1;
	uBitSend(connectedDevice,"Brik1 1");
    } else {
        console.log("sluk 1")
        button1.innerHTML = "Tænd";
	buttonState[1] = 0;
	uBitSend(connectedDevice,"Brik1 0");
    }

};

button2.onclick = () => {
    
    if (buttonState[2] == 0) {
        console.log("tænd 2")
	button2.innerHTML = "Sluk";
	buttonState[2] = 1;
	uBitSend(connectedDevice,"Brik2 1");
    } else {
        console.log("sluk 2")
        button2.innerHTML = "Tænd";
	buttonState[2] = 0;
	uBitSend(connectedDevice,"Brik2 0");
    }

};

button3.onclick = () => {
    
    if (buttonState[3] == 0) {
        console.log("tænd 3")
	button3.innerHTML = "Sluk";
	buttonState[3] = 1;
	uBitSend(connectedDevice,"Brik3 1");
    } else {
        console.log("sluk 3")
        button3.innerHTML = "Tænd";
	buttonState[3] = 0;
	uBitSend(connectedDevice,"Brik3 0");
    }

};

button4.onclick = () => {
    
    if (buttonState[4] == 0) {
        console.log("tænd 4")
	button4.innerHTML = "Sluk";
	buttonState[4] = 1;
	uBitSend(connectedDevice,"Brik4 1");
    } else {
        console.log("sluk 4")
        button4.innerHTML = "Tænd";
	buttonState[4] = 0;
	uBitSend(connectedDevice,"Brik4 0");
    }

};

button5.onclick = () => {
    
    if (buttonState[5] == 0) {
        console.log("tænd 5")
	button5.innerHTML = "Sluk";
	buttonState[5] = 1;
	uBitSend(connectedDevice,"Brik5 1");
    } else {
        console.log("sluk 5")
        button5.innerHTML = "Tænd";
	buttonState[5] = 0;
	uBitSend(connectedDevice,"Brik5 0");
    }

};

button6.onclick = () => {
    
    if (buttonState[6] == 0) {
        console.log("tænd 6")
	button6.innerHTML = "Sluk";
	buttonState[6] = 1;
	uBitSend(connectedDevice,"Brik6 1");
    } else {
        console.log("sluk 6")
        button6.innerHTML = "Tænd";
	buttonState[6] = 0;
	uBitSend(connectedDevice,"Brik6 0");
    }

};

button7.onclick = () => {
    
    if (buttonState[7] == 0) {
        console.log("tænd 7")
	button7.innerHTML = "Sluk";
	buttonState[7] = 1;
	uBitSend(connectedDevice,"Brik7 1");
    } else {
        console.log("sluk 7")
        button7.innerHTML = "Tænd";
	buttonState[7] = 0;
	uBitSend(connectedDevice,"Brik7 0");
    }

};


button8.onclick = () => {
    
    if (buttonState[8] == 0) {
        console.log("tænd 8")
	button8.innerHTML = "Sluk";
	buttonState[8] = 1;
	uBitSend(connectedDevice,"Brik8 1");
    } else {
        console.log("sluk 8")
        button8.innerHTML = "Tænd";
	buttonState[8] = 0;
	uBitSend(connectedDevice,"Brik8 0");
    }

};

button9.onclick = () => {
    
    if (buttonState[9] == 0) {
        console.log("tænd 9")
	button9.innerHTML = "Sluk";
	buttonState[9] = 1;
	uBitSend(connectedDevice,"Brik9 1");
    } else {
        console.log("sluk 9")
        button9.innerHTML = "Tænd";
	buttonState[9] = 0;
	uBitSend(connectedDevice,"Brik9 0");
    }

};


button10.onclick = () => {
    
    if (buttonState[10] == 0) {
        console.log("tænd 10")
	button10.innerHTML = "Sluk";
	buttonState[10] = 1;
	uBitSend(connectedDevice,"Brik10 1");
    } else {
        console.log("sluk 10")
        button10.innerHTML = "Tænd";
	buttonState[10] = 0;
	uBitSend(connectedDevice,"Brik10 0");
    }

};


