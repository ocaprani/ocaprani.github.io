/*
 * DOM elments
 */
const connectButton = document.getElementById("connectButton");
const disconnectButton = document.getElementById("disconnectButton");

const connected = document.getElementById("connected");
const connectedText = document.getElementById("connected-text");
const usbOutput = document.getElementById("usb-output");

// initial text
connectedText.innerText = "Micro:bit not connected."


/**
 * Parser with buffer (Array) for parsing the micro:bit sieral port.
 * Assumes:
 *   * Sequence of ascii characters, Uint8.
 *   * Data organized by key-value pair.
 *   * Sequences of key-values are separated by CR followed by LF.
 *   * Key and values are separated by a colon.
 *   * Leading and trailing spaces are not important.
 *   * Also assumes that the op and length have been stripped off.
 *
 * The instance should be created by passing a handler for the parsed
 * key-value pair in the constructor. Use the class instance
 * by calling parse(input).
**/
class BufferParser {
  // Key-value sequence separator
  #CR = 0xd; // 13
  #LF = 0xa; //10
  // CR proceeds LF

  // key-value separator
  #COLON = 0x3a; // 58

  // Spaces pad the message
  #SPACE = 0x20;  // 32

  // Buffer from the characters from the serial port
  #buffer = new Array();
  // An array is used because it does not have a fixed length.

  constructor(handler){
    if (handler != undefined ) this.handle = handler;
  }

  parse(input){
    // input should be an Array with Uint8 elements
    // add input to the end of buffer
    this.#buffer.push(...input);

    while (this.#buffer.length > 0) { // Parsing while loop.
      // Find CR index separating the key-value sequence.
      // and the COLON index separatinng the key and value.
      // console.log("parse: in while.");
      const crIndex = this.#buffer.findIndex(e => e == this.#CR);
      // console.log("CR: "+crIndex);
      const colonIndex = this.#buffer.findIndex(e => e == this.#COLON);
      // console.log("COLON: "+colonIndex);

      // This is the exit from the while loop.
      if (crIndex == -1 || colonIndex == -1) break;
      // The buffer is not large enough to parse.

      if (colonIndex > crIndex){
        console.log("Pasing: Buffer corrupted to the left of CR. Throwing it away.");
        this.#buffer.splice(0, crIndex+1);
        continue; // try parsing the rest of the buffer.
      }
      else{ // colonIndex < crIndex. There is a key value pair.
        let lfIndex = this.#buffer.findIndex(e => e == this.#LF);
        // console.log("LF: "+lfIndex);
        // Ideally LF index should be at the left of the key and at 0 index.

        // LF does not exist, we will assume that the data is OK.
        if(lfIndex == -1) console.log("Parsing: LF was not found. Setting LF is -1.");

        // LF to the right of CR. LF  noramlly follows CR.
        // We do not want it. Next iteration this LF will be at index 0.
        if (lfIndex > crIndex ) {
          console.log("Parsing: No LF before CR. Setting LF to -1.");
          lfIndex = -1;
        }

        // This should never happen. So if it does, throw it awway.
        if (lfIndex > colonIndex && lfIndex < crIndex){
          console.log("Parising: LF > COLON. Key-value pair is corrupted. Throwing it away.");
          this.#buffer.splice(0, crIndex+1);
          continue; // try parsing next section.
        }

        // This is just a warning that part of the data will be lost.
        if (lfIndex > 0 && lfIndex < crIndex)
          console.log("Parising: LF > 0. Throwing away left portion.");

        // This shoud be the typical case, LF at -1 or 0.
        // Get the key and the value.
        const key = this.#buffer.slice(lfIndex + 1, colonIndex);
        const value = this.#buffer.slice(colonIndex + 1, crIndex);

        // Dispose of the parsed section from the buffer.
        // There is a LF after CR it will be located at 0 after the splice.
        this.#buffer.splice(0, crIndex+1);

        // Handle the key and value pair.
        this.handle(key, value);

      } // end else colonIndex < crIndex.
    } // end Parsing while loop.
  } // end parse method.

  // Default Handler
  handle(key, value){
    console.log("key: "+String.fromCharCode(...key)+" | value: "+String.fromCharCode(...value));
  }

} // end class BufferParser


let myHandler = (key, value) => {
  const keyString = String.fromCharCode(...key).trim();
  const valueString = String.fromCharCode(...value).trim();
  console.log("myHandler: key: "+keyString+" | value: "+valueString);

  switch (keyString) {
    case "temp":
      // Display the temperature on the display
      const temp = Number.parseFloat(valueString).toFixed(2);
      usbOutput.innerText = "Temperature is "+temp+" C";
      break;
    case "event":
      // display the event
      usbOutput.innerText = "Button Pressed";
      break;
    default:
      console.log("Unexpected key: "+keyString+"the value was: "+valueString);
  }
}
let parser = new BufferParser(myHandler);

/**
 * Initialize communication by:
 *   1. Request device
 *   2. Select a configuration
 *   3. Claim an interface
**/
// Vendor id
const microbitId = 0x0d28;

let device; // This is the USBDevice selected by the user.

connectButton.onclick = async () => {
  device = await navigator.usb.requestDevice({
    filters: [{ vendorId: microbitId }]
  });

  console.log(device);

  await  device.open();
  console.log("opened");

  await device.selectConfiguration(1);
  console.log("configuration selected");

  await device.claimInterface(interfaceNumber);
  console.log("claimed interface "+ interfaceNumber);

  // Styling after connected.
  connectedText.innerText = "Micro:bit connected!"
  connectedText.style.display = "block";
  usbOutput.style.display = "block";

  connectButton.style.display = "none";
  disconnectButton.style.display = "initial";

  listen();
};


// vendor specific settings
const controlTransferGetReport = 0x01;
const controlTransferSetReport = 0x09;
const controlTransferOutReport = 0x200;
const controlTransferInReport = 0x100;

// Interface for the controlled transfers. There are no endpoints.
const interfaceNumber = 4;

// Settings for controlled Transefer into host.
const controlTransferInSettings = {
  requestType: "class",
  recipient: "interface",
  request: controlTransferGetReport,
  value: controlTransferInReport,
  index: interfaceNumber
};

// Settings of controlled transfered out from the host.
const controlTransferOutSettings = {
  requestType: "class",
  recipient: "interface",
  request: controlTransferSetReport,
  value: controlTransferOutReport,
  index: interfaceNumber
};

// This is the number of bytes in the serial buffer.
const serialBufferSize = 64;

// I'm not sure if this acknownledgement or command to write serial message.
// This is used in controlTransferOut. Needs to be a BufferArray.
const serialMsg = 0x83;
const cmdTypeArray = new Uint8Array(1);
cmdTypeArray.set([serialMsg]);

// This is the delay between listen calls,
// so that listen does not still all the processor cycles.
const listenDelay = 300;

/**
 * This function is the serial read loop:
 *    1. Make a controlTransferOut polling the device on the USB
 *    2. Make a controlTransferIn reading the device buffer
 *    3. Check that the data from the buffer is from the correct command
 *    4. Get the data length
 *    5. Send the parser the data if there is data
 *    6. Delay the next call to listen.
 * Note that the function recursive.
**/
const listen = async () => {
  // Send "write" message to the device

  const resultOut = await device.controlTransferOut(controlTransferOutSettings, cmdTypeArray);
  // console.log(resultOut);
  if(resultOut.status != "ok"){
    console.log("controlTransferOut failed!");
    setTimeout(listen, listenDelay);
  }

  // Read the serial buffer on the device
  const resultIn = await device.controlTransferIn(controlTransferInSettings, serialBufferSize);
  // console.log(resultIn);
  if(resultIn.status != "ok") console.log("controlTransferIn failed.");
  else{
    const resultArray = new Uint8Array(resultIn.data.buffer); // This is the serial buffer.
    // console.log(resultArray);
    const len = resultArray[1]; // This is the length of data. It is sometimes zero and sometimes 62.
    // console.log(len);
    const opt = resultArray[0]; // This the command that the result is responding to.
    if (opt == serialMsg && len > 0){ // Check result is responding to correct command.
      const data = resultArray.slice(2, len+2); // The rest of the arrray is the data.
      parser.parse(data); // parse the data.
    }
  } // else
  setTimeout(listen, listenDelay);
}; // end listten function

// Shut downs the device.
disconnectButton.onclick = async () => {
  await device.close();

  // Disconnect styling and text
  connectedText.style.display = "block";
  connectedText.innerText = "Micro:bit not connected."
  usbOutput.style.display = "none";
  connectButton.style.display = "initial";
  disconnectButton.style.display = "none";
};
