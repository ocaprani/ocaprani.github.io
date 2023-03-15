
const TESTING = false;
let myPeerId = "";
myPeerNum = 0;

if (TESTING) {
    document.getElementById('canvas-div').style.backgroundColor = "salmon";

    if (location.hash.length > 0) {
        myPeerNum = parseInt(location.hash.substring(1));
        myPeerId = "peer" + location.hash.substring(1);
    } else {
        myPeerNum = 0;
        myPeerId = "peer0";
    }
    if (location.hash === '#0') {
        document.querySelector('#connect-input').value = "peer1";
    }
    else {
        document.querySelector('#connect-input').value = "peer0";
    }
    document.title = myPeerId;
} else {
    myPeerNum = Math.random().toString().slice(2, 5);
    myPeerId = "peer" + myPeerNum;
    document.querySelector('#status-text').textContent = myPeerId
}
document.getElementById('myPeerText').textContent = "Your peer id is: " + myPeerId;



let peer = new Peer(myPeerId);
console.log(peer);
let peerConnections = [];
let conn = null;
let reconnectTiemout = null;

let logData = [];

let isDrawing = false;
let isDragging = false;
let brushSettings = { size: 50, color: "black" };
let pathsDrawn = [];
let pathsUndone = [];
let points = [];
let showMine = true;
let imgs = [];
let otherPeerPoints = {};
let rooms = [{ name: "Private room", owner: myPeerId, peers: [myPeerId] }];
let curRoomName = rooms[0].name;

var mouse = { x: 0, y: 0 };
var previous = { x: 0, y: 0 };
var canvasPosition = { x: 0, y: 0 };

var currentImg = { img: null, x: 0, y: 0 };

let colorEl = document.getElementsByClassName('color');


function init() {
    let canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    w = canvas.parentElement.clientWidth;
    h = canvas.parentElement.clientHeight - 2;
    canvas.width = w;
    canvas.height = h;
    
    // let canvasDiv = document.getElementById('canvas-div');
    // canvasDiv.width = w;
    // canvasDiv.height = h;
    // console.log("canvas size: " + w + "x" + h);
    // let canvas2 = document.getElementById('canvas2');
    // ctx2 = canvas2.getContext("2d");
    // canvas2.width = w;
    // canvas2.height = h;
    // canvas2.style.top = canvas.offsetTop + "px";
    // canvas2.style.left = "0px";


    document.getElementById('showAllCheckbox').checked = true;
    document.getElementById('cb0').checked = true;
    document.getElementsByClassName('peerName')[0].textContent = myPeerId + " (You)"

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    colorEl[myPeerNum % colorEl.length].click();



    canvas.addEventListener('mousedown', function (e) {
        onMouseDown(e);
    });

    canvas.addEventListener('mousemove', function (e) {
        onMouseMove(e);
    });


    canvas.addEventListener('mouseup', function (e) {
        onMouseUp(e);
    });


    canvas.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    canvas.addEventListener('mouseleave', function (e) {
        onMouseUp(e);
    });

    canvas.addEventListener('touchstart', function (e) {
        e.preventDefault();
        onMouseDown(e);
    });

    canvas.addEventListener('touchmove', function (e) {
        e.preventDefault();
        onMouseMove(e);
    });

    canvas.addEventListener('touchend', function (e) {
        e.preventDefault();
        onMouseUp(e);
    });

    canvas.addEventListener('touchcancel', function (e) {
        e.preventDefault();
        onMouseUp(e);
    });


    document.querySelector('#connect-btn').addEventListener('click', () => {
        if (peerConnections.length == 0) {
            rooms = [];
            // updateRoomList();
        }
        onOpenConn(document.querySelector('#connect-input').value)
    })



    // canvas.addEventListener("mousemove", function (e) {
    //     findxy('move', e)
    // });
    // canvas.addEventListener("mousedown", function (e) {
    //     findxy('down', e)
    // });
    // canvas.addEventListener("mouseup", function (e) {
    //     findxy('up', e)
    // });
    // canvas.addEventListener("mouseout", function (e) {
    //     findxy('out', e)
    // });
}


function onMouseUp(e) {

    if (e.button === 0 || e.type == "touchend" || e.type == "touchcancel") {
        
        if (!isDrawing) return;

        if (e.touches != undefined && e.touches.length > 0) {
            mouse = getMousePos(e.touches[e.touches.length - 1]);
        }

        isDrawing = false;
        // Adding the path to the array or the paths
        var path = { points: [points], color: ctx.strokeStyle, width: ctx.lineWidth, room: curRoomName };
        pathsDrawn.push(path);
        sendToAllPeers({ msgType: "paths", paths: [path] });
    } else if (e.button === 2) {
        isDragging = false;
        document.getElementById("canvas").style.cursor = "default";
    }
}

function onMouseMove(e) {
    e.preventDefault();
    // console.log("onMouseMove:", isDrawing);

    if (isDrawing) {
        previous = { x: mouse.x, y: mouse.y };
        previous_adjusted = { x: previous.x - canvasPosition.x, y: previous.y - canvasPosition.y };
        mouse = getMousePos(e);
        // saving the points in the points array
        // current = { x: mouse.x, y: mouse.y }
        current_adj = { x: mouse.x - canvasPosition.x, y: mouse.y - canvasPosition.y };
        points.push(current_adj);
        // drawing a line from the previous point to the current point
        ctx.strokeStyle = brushSettings.color;
        ctx.lineWidth = brushSettings.size;
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
        sendToAllPeers({
            msgType: "draw", newPoints: current_adj, prevPoints: previous_adjusted,
            color: ctx.strokeStyle, width: ctx.lineWidth, room: curRoomName, time: Date.now()
        });
    } else if (isDragging) {
        previous = { x: mouse.x, y: mouse.y };
        mouse = getMousePos(e);
        canvasPosition.x += mouse.x - previous.x;
        canvasPosition.y += mouse.y - previous.y;
        redrawCanvas();
        // redrawCanvas2(mouse.x - previous.x, mouse.y - previous.y);
    }
}

function onMouseDown(e) {
    // console.log("Mousedown:", Date.now());
    // console.log(e);
    mouse = getMousePos(e);
    previous = { x: mouse.x, y: mouse.y };
    if (e.button == 0 || e.type == "touchstart") {
        if (e.touches != undefined && e.touches.length > 1) {
            onMouseUp({ type: "touchcancel" });
            isDragging = true;
        } else {
            isDrawing = true;
            points = [];
            points.push({ x: mouse.x - canvasPosition.x, y: mouse.y - canvasPosition.y });
        }
    } else if (e.button == 2) {
        isDragging = true;
        document.getElementById("canvas").style.cursor = "move";
        // currentImg = { img: ctx2.getImageData(0, 0, canvas2.width, canvas2.height), x: 0, y: 0 };
    }

}

function onOpenConn(peerId) {
    var peerIdList = peerConnections.map((conn) => conn.peer)
    if (peerId === myPeerId) { return; }
    if (!peerIdList.includes(peerId)) {
        let newConn = peer.connect(peerId);
        newConn.on("open", () => {
            peerConnections.push(newConn);
            newConn.send({ msgType: "network", peerList: peerIdList, paths: pathsDrawn, rooms: rooms });
            document.getElementById('status-text').textContent = "Connected to " + newConn.peer;

            let showPeerInRoom = {};
            rooms.forEach(room => {
                showPeerInRoom[room.name] = true;
            });

            otherPeerPoints[newConn.peer] = {
                showInRoom: showPeerInRoom,
                paths: []
            };
            // addToPeerList(newConn.peer);
            // document.getElementById('curRoomText').textContent = "In room: Public room";
            // document.getElementById('roomList-text').textContent = "Main room";

            redrawCanvas(false);
        });
    } else if (TESTING) {
        christiansAlg(peerId);
        sendToAllPeers({ msgType: "logData", logData: logData});
    }
}


function addToPeerList(peerId) {
    let peerItems = document.getElementsByClassName('peerItem');
    let li = peerItems[0];
    let newId = li.children[0].id.replace("0", peerItems.length);
    let newLi = li.cloneNode(true)
    newLi.children[0].id = newId
    newLi.children[1].setAttribute("for", newId)
    newLi.children[1].textContent = peerId
    if (otherPeerPoints[peerId] !== undefined && otherPeerPoints[peerId].showInRoom[curRoomName] !== undefined) {
        newLi.children[0].checked = otherPeerPoints[peerId].showInRoom[curRoomName];
    } else {
        newLi.children[0].checked = true;
    }
    li.parentElement.appendChild(newLi)
}


function removeAllFromPeerList() {
    let peerItems = document.getElementsByClassName('peerItem');
    let amount = peerItems.length;
    for (let i = 1; i < amount; i++) {
        peerItems[1].remove();
    }
}


function setBrush(obj) {

    for (let i = 0; i < colorEl.length; i++) {
        colorEl[i].style.border = "1px solid black";
        colorEl[i].style.height = "30px";
        colorEl[i].style.width = "30px";
    }
    document.getElementById('eraser').style.border = "2px solid black";

    if (obj.id === "eraser") {
        let cDiv = document.getElementById("canvas-div")
        let color = window.getComputedStyle(cDiv).backgroundColor;
        obj.style.border = "4px solid black";
        brushSettings = { color: color, size: 50 };
        return
    } else {
        obj.style.border = "4px solid black";
        obj.style.height = "40px";
        obj.style.width = "40px";
    }

    // ctx.strokeStyle = obj.style.background;
    // ctx.lineWidth = 4;
    brushSettings = { color: obj.style.background, size: 4 };
}

function canvasHome() {
    canvasPosition = { x: 0, y: 0 };
    redrawCanvas(false);
}

function draw() {
    sendToAllPeers({ msgType: "draw", x: currX, y: currY, prevx: prevX, prevy: prevY, color: strokeColor, width: strokeWidth });
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    ctx.beginPath();
    ctx.moveTo(prevX, prevY);
    ctx.lineTo(currX, currY);
    ctx.stroke();
    ctx.closePath();
}

function sendToAllPeers(package) {
    if (peerConnections.length > 0) {
        peerConnections.forEach((conn) => {
            conn.send(package);
        });
    }
}

function getMousePos(e) {
    let boundingRect = canvas.getBoundingClientRect();
    if (e.touches != undefined) {
        return {
            x: e.touches[0].pageX - boundingRect.left,
            y: e.touches[0].pageY - boundingRect.top
        };
    } else {
        return {
            x: Math.round(e.clientX - boundingRect.left),
            y: Math.round(e.clientY - boundingRect.top)
        };
    }
}


function redrawCanvas(sync) {
    if (sync) {
        sendToAllPeers({ msgType: "redraw" });
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showMine) {
        pathsDrawn.forEach(path => {
            drawPath(path, ctx);
        });
    }

    peerConnections.forEach(conn => {
        let pp = otherPeerPoints[conn.peer]
        if (pp !== undefined && pp.showInRoom[curRoomName]) {
            pp.paths.forEach(path => {
                drawPath(path, ctx);
            });
        }
    });
    ctx.closePath();

    imgs.forEach(img => {
        ctx.drawImage(img, canvasPosition.x, canvasPosition.y);
    });
}

function redrawCanvas2(x, y) {
    currentImg.x += x;
    currentImg.y += y;
    // console.log("redrawing canvas2", currentImg.x, currentImg.y)
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    // ctx2.drawImage(img, canvasPosition.x, canvasPosition.y);
    // ctx2.putImageData(currentImg.img, currentImg.x, currentImg.y);

}

function drawPath(path, ctx) {
    if (path.room !== curRoomName) {
        return;
    }

    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    path.points.forEach(p => {
        ctx.beginPath();
        ctx.moveTo(p[0].x + canvasPosition.x, p[0].y + canvasPosition.y);
        for (let i = 1; i < p.length; i++) {
            ctx.lineTo(p[i].x + canvasPosition.x, p[i].y + canvasPosition.y);
        }
        ctx.stroke();
    });
}


function canvasUndo() {
    if (pathsDrawn.length > 0) {
        pathsUndone.push([pathsDrawn.pop()]);
        sendToAllPeers({ msgType: "undo" });
        redrawCanvas(true);
    }
}

function canvasRedo() {
    if (pathsUndone.length > 0) {
        pathsUndone.pop().forEach(path => {
            pathsDrawn.push(path);
            sendToAllPeers({ msgType: "paths", paths: [path] });
        });
        redrawCanvas(true);
    }
}

function canvasClear() {
    let ps = pathsDrawn.splice(0, pathsDrawn.length);
    pathsUndone.push(ps);
    imgs = [];
    sendToAllPeers({ msgType: "clear" });
    redrawCanvas(true);
}

// function canvasimg_save() {
//     document.getElementById("canvasimg").style.border = "2px solid";
//     var dataURL = canvas.toDataURL();
//     document.getElementById("canvasimg").src = dataURL;
//     document.getElementById("canvasimg").style.display = "inline";
// }

function saveImg() {
    var dataURL = canvas.toDataURL();
    var link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = dataURL;
    link.click();
}

function saveJSON() {
    let listOfopp = peerConnections
        .map(conn => {
            return otherPeerPoints[conn.peer].paths;
        }).flat(depth = 1);
    console.log(listOfopp);
    let data = JSON.stringify({
        pathsDrawn: pathsDrawn.filter(path => path.room === curRoomName),
        pathsUndone: pathsUndone.filter(paths => paths[0].room === curRoomName),
        otherPeerPoints: listOfopp.filter(path => path.room === curRoomName)
    });
    let link = document.createElement('a');
    link.download = 'drawing.json';
    link.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(data);
    link.click();
}


function saveApp() {
    fetch("../../zip_download/app.zip")
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "app.zip";
            link.click();
        })
        .catch(console.error);
}


// load a locally saved image or JSON to canvas
function load(e) {
    var file = e.target.files[0];
    if (file.type == "image/png" || file.type == "image/jpeg") {
        var reader = new FileReader();
        reader.onload = function (e) {
            console.log("Image loaded");
            var img = new Image();
            img.onload = function () {
                ctx.drawImage(img, canvasPosition.x, canvasPosition.y);
                imgs.push(img);
            }
            img.src = e.target.result;
            // console.log(img);
            // sendToAllPeers({ msgType: "img2", img: img });
        }
        reader.readAsDataURL(file);
    } else if (file.type == "application/json" || file.type == "text/json") {
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = JSON.parse(e.target.result);

            let pd = data.pathsDrawn;
            pd.forEach(path => path.room = curRoomName);
            let po = data.otherPeerPoints;
            po.forEach(path => path.room = curRoomName);
            pathsDrawn = pathsDrawn.concat(pd, po);

            let pu = data.pathsUndone;
            pu.forEach(paths => paths[0].room = curRoomName);
            pathsUndone = pathsUndone.concat(pu);

            redrawCanvas(false);
        }
        reader.readAsText(file);
    } else {
        alert("Invalid file type");
    }
}

function findxy(res, e) {
    if (res == 'up' || res == "out") {
        isDrawing = false;
    }
    if (res == 'down') {
        prevX = currX;
        prevY = currY;
        currX = e.clientX - canvas.getBoundingClientRect().left;
        currY = e.clientY - canvas.getBoundingClientRect().top;

        isDrawing = true;
        dot_flag = true;
        if (dot_flag) {
            ctx.beginPath();
            ctx.fillStyle = strokeColor;
            ctx.fillRect(currX, currY, 2, 2);
            ctx.closePath();
            dot_flag = false;
        }
    }
    if (res == 'move') {
        if (isDrawing) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.getBoundingClientRect().left;
            currY = e.clientY - canvas.getBoundingClientRect().top;
            draw();
        }
    }
}

function showPeerDrawings(element) {
    if (element.checked) {
        canvas2.style.display = "block";
    } else {
        canvas2.style.display = "none";
    }
}



function createRoom() {
    let newRoom = { name: "Room" + (rooms.length + 1), owner: myPeerId, peers: [] };
    addRoom(newRoom);
    sendToAllPeers({ msgType: "newRoom", room: newRoom });
    updateRoomList()
}


function addRoom(roomToAdd) {
    if (!rooms.map(r => { return r.name }).includes(roomToAdd.name)) {
        rooms.push(roomToAdd);
        peerConnections.forEach(conn => {
            otherPeerPoints[conn.peer].showInRoom[roomToAdd.name] = true;
        });
    } else if (roomToAdd.name === curRoomName) {
        addAllToRoom(roomToAdd.peers, curRoomName);
    }
}



function addAllToRoom(peersToAdd, roomName) {
    let peersInCurRoom = rooms.find(r => r.name === roomName).peers
    peersToAdd.forEach(peer => {
        if (!peersInCurRoom.includes(peer) && peer !== myPeerId) {
            peersInCurRoom.push(peer);
            if (roomName === curRoomName) {
                addToPeerList(peer);
            }
        }
    });
}




function changeRoom(newRoomName) {
    if (newRoomName === curRoomName) {
        return;
    }

    sendToAllPeers({ msgType: "changeRoom", toRoom: newRoomName, fromRoom: curRoomName });

    removeAllFromPeerList();
    let newRoom = rooms.find(room => room.name === newRoomName);
    newRoom.peers.push(myPeerId);
    newRoom.peers.forEach(peer => {
        if (peer !== myPeerId) {
            addToPeerList(peer);
        }
    });

    let disableableCbs = document.getElementsByClassName('disableable');
    let setCursorTo = newRoom.owner === myPeerId ? "default" : "not-allowed";
    for (let i = 0; i < disableableCbs.length; i++) {
        disableableCbs[i].style.cursor = setCursorTo;
    }

    if (newRoom.owner !== myPeerId) {
        document.getElementById('showAllCheckbox').style.display = "none";
    } else {
        document.getElementById('showAllCheckbox').style.display = "inline-block";
    }

    let curRoomObj = rooms.find(room => room.name === curRoomName)
    if (curRoomObj !== undefined) {
        curRoomObj.peers.splice(curRoomObj.peers.indexOf(myPeerId), 1);
    }

    curRoomName = newRoomName;
    redrawCanvas(false);
    updateRoomList();
}


function updateRoomList() {
    let li = document.getElementsByClassName('roomItem')[0];

    let roomList = document.getElementById("roomList");
    roomList.innerHTML = "";

    rooms.forEach(room => {
        let newLi = li.cloneNode(true);
        if (room.name === curRoomName) {
            newLi.classList.add("active");
        } else {
            newLi.classList.remove("active");
        }
        newLi.innerHTML = room.name;
        roomList.appendChild(newLi);
    });
}


function allPeerCheckbox(el) {
    let havePermission = rooms.filter(room => room.name === curRoomName)[0].owner === myPeerId;
    if (havePermission) {
        let cbs = document.getElementsByClassName('peerCheckbox');
        for (let i = 0; i < cbs.length; i++) {
            cbs[i].checked = !el.checked;
            cbs[i].click();
        }
    } else {
        el.checked = !el.checked;
    }
}


function peerCheckbox(el) {
    let havePermission = rooms.filter(room => room.name === curRoomName)[0].owner === myPeerId;
    if (havePermission) {
        let peerName = "";
        if (el.id === "cb0") {
            showMine = el.checked;
            peerName = myPeerId;
        } else {
            peerName = el.parentElement.children[1].textContent;
            otherPeerPoints[peerName].showInRoom[curRoomName] = el.checked;
        }
        sendToAllPeers({ msgType: "showPeer", show: el.checked, peer: peerName, room: curRoomName });
    } else {
        el.checked = !el.checked;
    }
    redrawCanvas(false);
}


let latestTimerOffset = 0;
// https://en.wikipedia.org/wiki/Cristian%27s_algorithm
function christiansAlg(toPeer) {
    // sendToAllPeers({ msgType: "timeRequest", timeRequest: Date.now() }); //t_0
    peerConnections
        .find(conn => { return conn.peer === toPeer })
        .send({ msgType: "timeRequest", timeRequest: Date.now() }); //t_1
}



init()


peer.on("connection", (conn) => {
    console.log("connection made to " + conn.peer);
    document.querySelector('#status-text').textContent = "Connected to " + conn.peer;
    document.getElementById('cb0').checked = true;
    let showPeerInRoom = {};
    rooms.forEach(room => {
        showPeerInRoom[room.name] = true;
    });

    otherPeerPoints[conn.peer] = {
        showInRoom: showPeerInRoom,
        paths: []
    };

    if (peerConnections.length == 0) {
        rooms = [];
        // updateRoomList();
    }

    // redrawPaths(false);
    // peerConnections.push(conn);
    conn.on("data", (data) => {
        // console.log(data.msgType);
        // if (data.msgType === "msg") {
        //     console.log("received: " + data);
        // } else if (data.msgType === "img") {
        //     var uint8View = new Uint8Array(data.img);
        //     var imgData = ctx2.createImageData(w, h);
        //     imgData.data.set(uint8View);
        //     ctx2.putImageData(imgData, 0, 0);
        // } else if (data.msgType === "draw") {
        //     ctx2.beginPath();
        //     ctx2.moveTo(data.prevx, data.prevy);
        //     ctx2.lineTo(data.x, data.y);
        //     ctx2.strokeStyle = data.color;
        //     ctx2.lineWidth = data.width;
        //     ctx2.stroke();
        //     ctx2.closePath();
        // }


        switch (data.msgType) {
            case "timeRequest":
                // sendToAllPeers({ msgType: "timeResponse", timeRequest: data.timeRequest, timeResponse: Date.now() }); //t_1
                peerConnections
                    .find(sendTo => { return sendTo.peer === conn.peer })
                    .send({ msgType: "timeResponse", timeRequest: data.timeRequest, timeResponse: Date.now() }); //t_1
                break;
            case "timeResponse":
                let t_1 = Date.now();
                let newTime = data.timeResponse + ((t_1 - data.timeRequest) / 2); // T + ((t_1 - t_0) / 2)
                latestTimerOffset = t_1 - newTime;
                console.log("offset to " + conn.peer + " = " + latestTimerOffset);
                break;
            case "logData":
                data.logData.forEach(log => {
                    console.log(log);
                });
                break;
            case "redraw":
                // ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
                // data.paths.forEach(path => {
                //     drawPath(path, ctx2);
                // })
                // ctx2.closePath();

                redrawCanvas(false);
                break;

            case "draw":
                if (TESTING) {
                    let tNow = Date.now();
                    let adjTime = tNow - latestTimerOffset;
                    logData.push("Adj: " + (adjTime - data.time).toString() + " - Diff " + 

                    (tNow - data.time).toString() + " - Offset: " + latestTimerOffset.toString() + 
                    " - Recieved: " + data.time.toString() + " - Now: " + tNow.toString()
                    );
                    console.log(logData[logData.length - 1]);
                }
                if (otherPeerPoints[conn.peer] !== undefined &&
                    otherPeerPoints[conn.peer].showInRoom[curRoomName] &&
                    data.room === curRoomName) {
                    ctx.strokeStyle = data.color;
                    ctx.lineWidth = data.width;
                    ctx.beginPath();
                    ctx.moveTo(data.prevPoints.x + canvasPosition.x, data.prevPoints.y + canvasPosition.y);
                    ctx.lineTo(data.newPoints.x + canvasPosition.x, data.newPoints.y + canvasPosition.y);
                    ctx.stroke();
                    ctx.closePath();
                }
                break;

            case "paths":
                data.paths.forEach(path => {
                    otherPeerPoints[conn.peer].paths.push(path);
                })
                redrawCanvas(false);
                break;

            case "img":
                let uint8View = new Uint8Array(data.img);
                let imgData = ctx2.createImageData(w, h);
                imgData.data.set(uint8View);
                ctx2.putImageData(imgData, canvasPosition.x, canvasPosition.y);
                break;

            case "img2":
                console.log(data.img)
                ctx2.drawImage(data.img, canvasPosition.x, canvasPosition.y);
                break;

            case "network":
                // console.log(myPeerId, "received network:", conn.peer);
                if (data.peerList.length === 0 && peerConnections.length === 0) {
                    addRoom({ name: "Main room", owner: myPeerId, peers: [] })
                } else if (data.rooms.length > 0) {
                    data.rooms.forEach(room => {
                        addRoom(room);
                    });
                }
                changeRoom(rooms[0].name);
                updateRoomList();
                let pl = data.peerList;
                pl.push(conn.peer);
                pl.forEach(peerId => {
                    onOpenConn(peerId);
                });

                data.paths.forEach(path => {
                    otherPeerPoints[conn.peer].paths.push(path);
                    drawPath(path, ctx);
                });
                break;

            case "undo":
                otherPeerPoints[conn.peer].paths.pop();
                redrawCanvas(false);
                break;

            case "clear":
                otherPeerPoints[conn.peer].paths = [];
                redrawCanvas(false);
                break;

            case "newRoom":
                addRoom(data.room);
                updateRoomList();
                break;

            case "showPeer":
                if (data.peer === myPeerId) {
                    showMine = data.show;
                    document.getElementById('cb0').checked = data.show;
                } else {
                    otherPeerPoints[data.peer].showInRoom[data.room] = data.show;
                }
                if (data.room === curRoomName) {
                    // update peerItem
                    let PeerItems = document.getElementsByClassName('peerItem')
                    for (let i = 0; i < PeerItems.length; i++) {
                        if (PeerItems[i].children[1].textContent === data.peer) {
                            PeerItems[i].children[0].checked = data.show;
                        }
                    }
                }
                redrawCanvas(false);
                break;

            case "changeRoom":
                // rooms.find(room => room.name === data.toRoom).peers.push(conn.peer);
                let oldRoomList = rooms.find(room => room.name === data.fromRoom);
                if (oldRoomList !== undefined) {
                    oldRoomList.peers.splice(oldRoomList.peers.indexOf(conn.peer), 1);
                }

                addAllToRoom([conn.peer], data.toRoom);

                if (data.fromRoom === curRoomName) {
                    // remove from peerList
                    let PeerItems = document.getElementsByClassName('peerItem')
                    for (let i = 0; i < PeerItems.length; i++) {
                        if (PeerItems[i].children[1].textContent === conn.peer) {
                            PeerItems[i].remove();
                        }
                    }
                }
                break;


            default:
                console.log("----- Unknown message type -----");
                break;
        }



    });

    // conn_1.on("open", () => {
    //     console.log("connection received");
    //     conn_1.send("hello!");
    // });
});



function tryReconnecting() {
    console.log("Trying to reconnect");
    if (!peer.disconnected) {
        sendToAllPeers({ type: "paths", paths: pathsDrawn})
        return
    }

    if (peerConnections.length !== 0) {
        peer.reconnect();
        setTimeout(tryReconnecting, 1000);
        // if (peer.disconnected) {
        // }

    }
}



peer.on("disconnected", () => {
    console.log("disconnected");
    reconnectTiemout = setTimeout(tryReconnecting, 1000);
});



