
const TESTING = false;
console.log("Version 0.2.1")



let myPeerId = "";
let myPeerNum = 0;
let peer = null;


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
    let debugNumber = 1;
    document.querySelector("#status-text").innerHTML = "Debug: " + debugNumber;
} else {
    // try 3 times
    for (let i = 0; i < 3; i++) {
        myPeerNum = Math.random().toString().slice(2, 6);
        myPeerId = "peer" + myPeerNum;
        peer = new Peer(myPeerId);
        console.log(peer);
        if (!peer.disconnected) {
            break;
        }
        console.log("Peer " + myPeerId + " disconnected, retrying");
    }
}

document.getElementById('myPeerText').textContent = "Dit person ID: " + myPeerId;



let peerConnections = [];
let conn = null;
let reconnectTimeout = null;
let peerIdLength = 8;

let logData = [];

let isDrawing = false;
let isDragging = false;
let inDeleteMode = false;
let inInsertedImageMode = false;
let deleteRadius = 20;
let brushSettings = { size: 50, color: "black" };
let pathsDrawn = [];
let pathsUndone = [];
let pathsDeleted = [];
let points = [];
let otherPeerPoints = {};
// let privateDrawingName = "Tegning";
// let firstPublicRoomName = "Tegning";
let rooms = [{ name: "Tegning", owner: myPeerId, peers: [myPeerId] }];
let roomPermissions = { "Tegning": true };
let curRoomName = rooms[0].name;

var mouse = { x: 0, y: 0 };
var previous = { x: 0, y: 0 };
var canvasPosition = { x: 0, y: 0 };

var movingImg = null;
var movingImgIndex = null;

let colorEl = document.getElementsByClassName('color');

let deleteCursor = "url('eraser.png') 0 32, auto"; // https://www.flaticon.com/free-icon/eraser_179530?term=eraser&page=1&position=4&origin=search&related_id=179530
let drawCursor = "url('pencil.png') 0 32, auto"; // https://www.flaticon.com/free-icon/pencil_588395?term=pencil&related_id=588395
let defaultCursor = drawCursor;




function init() {
    let canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    // w = canvas.parentElement.clientWidth;
    // h = canvas.parentElement.clientHeight - 2;
    
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w;
    canvas.height = h - document.getElementById('top').clientHeight;
    // TODO: if window is not wide enough for top, there will be a scrollbar,
    // which pushes the canvas down, and out of the window

    canvas.style.cursor = defaultCursor;


    // document.getElementById('showAllCheckbox').checked = true;
    document.getElementById('cb0').checked = true;
    document.getElementsByClassName('peerName')[0].textContent = myPeerId + " (Dig, Ejer)"

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Dont set to white or eraser
    colorEl[(myPeerNum % (colorEl.length-2)) + 1].click();



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

    window.addEventListener('resize', function() {
        // w = canvas.parentElement.clientWidth;
        // h = canvas.parentElement.clientHeight - 2;
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w;
        canvas.height = h - document.getElementById('top').clientHeight;
        redrawCanvas();
      });


    document.querySelector('#connect-btn').addEventListener('click', () => {
        // if (peerConnections.length == 0) {
        //     rooms = [];
        //     // updateRoomList();
        // }
        let connectTo = document.querySelector('#connect-input').value;
        onOpenConn(document.querySelector('#connect-input').value, true).then(() => {
            document.getElementById('status-text').textContent = "Forbindelse oprettet til " + connectTo;
        });
    });

    document.querySelector('#connect-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.querySelector('#connect-btn').click();
        }
    });

    document.querySelector('#room-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.querySelector('#room-button').click();
        }
    });

}


function onMouseUp(e) {

    if (e.button === 0 || e.type == "touchend" || e.type == "touchcancel") {
        canvas.style.cursor = inDeleteMode ? deleteCursor : defaultCursor;
        movingImg = null;
        if (!isDrawing) return;

        if (e.touches != undefined && e.touches.length > 0) {
            mouse = getMousePos(e.touches[e.touches.length - 1]);
        }

        isDrawing = false;
        // Adding the path to the array or the paths
        var path = { points: [points], color: brushSettings.color, width: brushSettings.size, room: curRoomName, type: "path" };
        pathsDrawn.push(path);
        sendToAllPeers({ msgType: "paths", paths: [path] });
        redrawCanvas();
    } else if (e.button === 2) {
        isDragging = false;
        movingImg = null;
        canvas.style.cursor = inDeleteMode ? deleteCursor : defaultCursor;
    }
}

function onMouseMove(e) {
    e.preventDefault();

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
        ctx.closePath();
        sendToAllPeers({
            msgType: "draw", newPoints: current_adj, prevPoints: previous_adjusted,
            color: brushSettings.color, width: brushSettings.size, room: curRoomName,
            time: Date.now(), type: "path"
        });
    } else if (isDragging) {
        previous = { x: mouse.x, y: mouse.y };
        mouse = getMousePos(e);
        canvasPosition.x += mouse.x - previous.x;
        canvasPosition.y += mouse.y - previous.y;
        redrawCanvas();

    } else if (movingImg != null) {
        previous = { x: mouse.x, y: mouse.y };
        mouse = getMousePos(e);
        movingImg.x += mouse.x - previous.x;
        movingImg.y += mouse.y - previous.y;
        sendToAllPeers({ msgType: "moveImg", index: movingImgIndex, x: movingImg.x, y: movingImg.y, room: curRoomName });
        redrawCanvas();
    }
    else if (inDeleteMode) {
        let closestPath = getClosestPath(getMousePos(e), false);
        redrawCanvas();
        if (closestPath != null && closestPath.type === "path") {
            // highlight closest path
            let pathToHighlight = closestPath.points[0]; // This was change, so there can only be one drawn line per path
            ctx.strokeStyle = closestPath.color;
            if (closestPath.color == "white") {
                ctx.strokeStyle = "lightgrey";
            }
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.moveTo(pathToHighlight[0].x + canvasPosition.x, pathToHighlight[0].y + canvasPosition.y);
            for (var i = 1; i < pathToHighlight.length; i++) {
                ctx.lineTo(pathToHighlight[i].x + canvasPosition.x, pathToHighlight[i].y + canvasPosition.y);
            }
            ctx.stroke();
            ctx.closePath();
        }
        else if (closestPath != null && closestPath.type === "img") {
            // console.log("Highlighting image: ", closestPath)
            ctx.strokeStyle = "black";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.setLineDash([30, 20]);
            ctx.rect(closestPath.x + canvasPosition.x, closestPath.y + canvasPosition.y, 
                     closestPath.img.width, closestPath.img.height);
            ctx.stroke();
            // reset dashed
            ctx.setLineDash([]);
            ctx.closePath();
        }
    }
}

function onMouseDown(e) {
    // console.log("Mousedown:", Date.now());
    // console.log(e);

    // TODO: If starts drawing while holding right click, the cursor image is wrong

    mouse = getMousePos(e);
    previous = { x: mouse.x, y: mouse.y };
    if (e.button == 0 || e.type == "touchstart") {
        if (e.touches != undefined && e.touches.length > 1) {
            onMouseUp({ type: "touchcancel" });
            // TODO: Move image
            isDragging = true;
        } else {
            if (inDeleteMode) {
                getClosestPath(getMousePos(e), true);
                return;
            } else if (inInsertedImageMode) {
                return;
            }
            isDrawing = true;
            points = [];
            points.push({ x: mouse.x - canvasPosition.x, y: mouse.y - canvasPosition.y });
        }
    } else if (e.button == 2) {
        // find image under mouse
        movingImg = null;
        movingImgIndex = -1;

        for (let i = 0; i < pathsDrawn.length; i++) {
            if (pathsDrawn[i].type == "img" && pathsDrawn[i].room == curRoomName && mouseOnImg(mouse, pathsDrawn[i])) {
                movingImg = pathsDrawn[i];
                movingImgIndex = i;
                break;
            }
        }
        
        // only drag if no image under cursor
        if (movingImg == null) {
            isDragging = true;
            document.getElementById("canvas").style.cursor = "move";
            movingImgIndex = null;
        } else {
            document.getElementById("canvas").style.cursor = "grabbing";            
        }

    }

}

function onOpenConn(peerId, toHigherPermissionNetwork) {
    if (peerId === myPeerId) { return; }
    // let existingPeer = peerConnections.find((conn) => conn.peer === peerId);
    // let existingPeer = otherPeerPoints[peerId];
    // if (existingPeer === undefined || existingPeer.unconnected) {
    let peerIdList = peerConnections.map((conn) => conn.peer);
    if (!peerIdList.includes(peerId)) {
        let newConn = peer.connect(peerId);
        
        if (newConn === undefined) {
            console.log("Connection failed");
            document.getElementById('status-text').textContent = "Fejl ved forbindelse til " + peerId;
            return;
        }

        newConn.on("error", (err) => {
            console.log(err);
            document.getElementById('status-text').textContent = "Fejl ved forbindelse til " + peerId;
        });

        newConn.on("close", () => {
            console.log("Connection closed");
            document.getElementById('status-text').textContent = "Afbrudt forbindelse til " + peerId;
            peerConnections = peerConnections.filter((conn) => conn.peer !== peerId);
            let curRoom = rooms.find(room => room.name === curRoomName);
            if (curRoom !== undefined) {
                let i = curRoom.peers.indexOf(peerId)
                if (i !== -1) {
                    curRoom.peers.splice(i, 1);
                }
            }
            updatePeopleInRoom(curRoom);

            delete otherPeerPoints[peerId];
            redrawCanvas();
        });


        // make promise which is resolved the connection is opened
        let connPromise = new Promise((resolve, reject) => {
            newConn.on("open", () => {
                peerConnections.push(newConn);
    
                let showPeerInRoom = {};
                rooms.forEach(room => {
                    showPeerInRoom[room.name] = true;
                });
                
                if (otherPeerPoints[peerId] === undefined) {
                    otherPeerPoints[peerId] = {
                        showInRoom: showPeerInRoom,
                        paths: []
                        // unconnected: false
                    };
                }
    
                // otherPeerPoints[peerId].unconnected = false;
    
                // pathsDrawn.forEach((path) => {
                //     if (path.room === privateDrawingName) {
                //         path.room = firstPublicRoomName;
                //     }
                // });
    
                let peersRoomsPermissions = {};
                // for each peer, add its permissions for each room
                peerIdList.forEach(peerId => {
                    peersRoomsPermissions[peerId] = {};
                    rooms.forEach(room => {
                        if (otherPeerPoints[peerId] !== undefined && otherPeerPoints[peerId].showInRoom[room.name] !== undefined) {
                            peersRoomsPermissions[peerId][room.name] = otherPeerPoints[peerId].showInRoom[room.name];
                        } else {
                            peersRoomsPermissions[peerId][room.name] = true;
                        }
                    });
                });
    
                // add myself
                peersRoomsPermissions[myPeerId] = {};
                rooms.forEach(room => {
                    peersRoomsPermissions[myPeerId][room.name] = roomPermissions[room.name];
                });
    
                newConn.send({ msgType: "network", peerList: peerIdList, paths: extractImageData(pathsDrawn), 
                            rooms: rooms, roomPermissions: peersRoomsPermissions, toHigherPermissionNetwork: toHigherPermissionNetwork });
    
                redrawCanvas();
                resolve();
            });
        });
        return connPromise;
    } else if (TESTING) {
        christiansAlg(peerId);
        sendToAllPeers({ msgType: "logData", logData: logData});
    }
}


function mouseOnImg(mouse, imgPath) {
    return imgPath.x <= mouse.x - canvasPosition.x &&
    imgPath.x + imgPath.img.width >= mouse.x - canvasPosition.x &&
    imgPath.y <= mouse.y - canvasPosition.y &&
    imgPath.y + imgPath.img.height >= mouse.y - canvasPosition.y
}


function addToPeerList(peerId, roomOwner) {
    let peerItems = document.getElementsByClassName('peerItem');
    let li = peerItems[0];
    let newId = li.children[0].id.replace("0", peerItems.length);
    let newLi = li.cloneNode(true)
    newLi.children[0].id = newId
    newLi.children[1].setAttribute("for", newId)
    let peerString = peerId;
    if (peerId === roomOwner) {
        peerString += " (Ejer)";
    }
    newLi.children[1].textContent = peerString;
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


function getClosestPath(mousePos, deletePath) {
    // console.log("deleting point");
    // find path with the closest point to the mouse
    // only my own paths
    let closestPath = null;
    // let closestPoint = null;
    let imgPaths = [];
    let closestDist = deleteRadius;
    pathsDrawn.forEach((path) => {
        if (path.type == "path" && path.room == curRoomName) {
            path.points.forEach((points) => {
                points.forEach((point) => {
                    // let dist = Math.sqrt(Math.pow(point.x - mousePos.x, 2) + Math.pow(point.y - mousePos.y, 2));
                    let dist = Math.sqrt(Math.pow(point.x - mousePos.x + canvasPosition.x, 2) + 
                                         Math.pow(point.y - mousePos.y + canvasPosition.y, 2));
                    if (dist < closestDist) {
                        closestDist = dist;
                        closestPath = path;
                        // closestPoint = point;
                    }
                });
            });
        } else if (path.type == "img" && path.room == curRoomName) {
            imgPaths.push(path);
        }
    });

    if (closestPath === null) {
        imgPaths.forEach((imgPath) => {
            if (mouseOnImg(mousePos, imgPath)) {
                closestPath = imgPath;
            }
        });
    }

    if (deletePath && closestPath !== null) {
        let indexToDelete = pathsDrawn.indexOf(closestPath)
        if (indexToDelete === -1) { return; }
        let deletedPath = pathsDrawn.splice(indexToDelete, 1);
        pathsDeleted.push(deletedPath);
        sendToAllPeers({ msgType: "deletePath", pathIndex: indexToDelete });
        redrawCanvas();
    }
    else {
        return closestPath;
    }
}


function setBrush(obj) {

    for (let i = 0; i < colorEl.length; i++) {
        colorEl[i].style.border = "1px solid black";
        colorEl[i].style.height = "30px";
        colorEl[i].style.width = "30px";
    }

    if (obj === undefined) {
        setDeleteMode(false);
        return;
    }

    defaultCursor = drawCursor;
    inInsertedImageMode = false;
    
    obj.style.border = "4px solid black";
    if (obj.id === "eraser") {
        setDeleteMode(true);
    }
    else {
        setDeleteMode(false);
        obj.style.height = "40px";
        obj.style.width = "40px";
    }


    brushSettings = { color: obj.style.background, size: 4 };
}


function canvasHome() {
    canvasPosition = { x: 0, y: 0 };
    redrawCanvas();
}


// delete?
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


function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // In order to draw the images first, we need to draw the paths in two passes
    let pathsToDrawn = [];

    let OrdpeerConnections = peerConnections.map(conn => conn.peer);
    OrdpeerConnections.push(myPeerId);
    OrdpeerConnections.sort();
    OrdpeerConnections.forEach(peer => {
        if (peer === myPeerId) {
            pathsDrawn.forEach(path => {
                if (path.type === "img" && path.room === curRoomName) {
                    drawToCtx(path);
                } else {
                    pathsToDrawn.push(path);
                }
            });
        } else {
            let pp = otherPeerPoints[peer]
            if (pp !== undefined && pp.showInRoom[curRoomName]) {
                pp.paths.forEach(path => {
                    if (path.type === "img" && path.room === curRoomName) {
                        drawToCtx(path);
                    } else {
                        pathsToDrawn.push(path);
                    }
                });
            }
        }
    });
    

    pathsToDrawn.forEach(path => {
        drawPath(path);
    });

    
    // if (inDeleteMode) {
    //     // draw small circles at the beginning of each path, with the same color as the path
    //     pathsToDrawn.forEach(path => {
    //         ctx.beginPath();
    //         ctx.arc(path.points[0][0].x + canvasPosition.x, path.points[0][0].y + canvasPosition.y, 10, 0, 2 * Math.PI);
    //         ctx.fillStyle = path.color;
    //         ctx.fill();
    //         ctx.closePath();
    //     });
    // }


    ctx.closePath();

}


function setDeleteMode(setTo) {
    inDeleteMode = setTo;
    canvas.style.cursor = setTo ? deleteCursor : defaultCursor;
    redrawCanvas();
}

function drawToCtx(path) {
    ctx.drawImage(path.img, canvasPosition.x + path.x, canvasPosition.y + path.y, path.img.width, path.img.height);
}

function drawPath(path) {
    if (path.room !== curRoomName) {
        return;
    }

    if (path.type === "img") {
        drawToCtx(path);
        return
    }

    ctx.strokeStyle = path.color;
    ctx.lineWidth = path.width;
    ctx.beginPath();
    path.points.forEach(p => {
        ctx.moveTo(p[0].x + canvasPosition.x, p[0].y + canvasPosition.y);
        for (let i = 1; i < p.length; i++) {
            ctx.lineTo(p[i].x + canvasPosition.x, p[i].y + canvasPosition.y);
        }
        ctx.stroke();
    });
    ctx.closePath();
}


function canvasUndo() {
    if (pathsDrawn.length > 0) {
        pathsUndone.push([pathsDrawn.pop()]);
        sendToAllPeers({ msgType: "undo" });
        redrawCanvas();
    }
}

function canvasRedo() {
    if (pathsUndone.length > 0) {
        pathsUndone.pop().forEach(path => {
            pathsDrawn.push(path);
            if (path.type === "img") {
                sendToAllPeers({ msgType: "img", img: path.img.src, room: path.room, scale: path.scale, x: path.x, y: path.y });
            } else {
                sendToAllPeers({ msgType: "paths", paths: [path] });
            }
        });
        redrawCanvas();
    }
}

function canvasClear() {
    if (pathsDrawn.length === 0) {
        return;
    }
    let ps = pathsDrawn.splice(0, pathsDrawn.length);
    pathsDeleted.push(ps);
    sendToAllPeers({ msgType: "clear" });
    redrawCanvas();
}


function CanvasUndoDelete() {
    if (pathsDeleted.length === 0) {
        return;
    }
    let paths = pathsDeleted.pop();
    paths.forEach(path => {
        pathsDrawn.push(path);
        if (path.type === "img") {
            sendToAllPeers({ msgType: "img", img: path.img.src, room: path.room, scale: path.scale, x: path.x, y: path.y });
        } else {
            sendToAllPeers({ msgType: "paths", paths: [path] });
        }
    });

    redrawCanvas();
}


function saveImg() {
    var dataURL = canvas.toDataURL();
    var link = document.createElement('a');
    link.download = 'Tegning.png';
    link.href = dataURL;
    link.click();
}


function extractImageData(paths) {
    return paths.map(path => {
        if (path.type === "img") {
            return { type: "img", img: path.img.src, room: path.room, scale: path.scale, x: path.x, y: path.y };
        } else {
            return path;
        }
    });
}


function saveJSON() {
    let listOfopp = peerConnections
        .map(conn => {
            return otherPeerPoints[conn.peer].paths;
        }).flat(depth = 1);
    console.log(listOfopp);

    let data = JSON.stringify({
        pathsDrawn: extractImageData(pathsDrawn).filter(path => path.room === curRoomName),
        pathsUndone: extractImageData(pathsUndone).filter(paths => paths[0].room === curRoomName),
        otherPeerPoints: extractImageData(listOfopp).filter(path => path.room === curRoomName)
    });
    let link = document.createElement('a');
    link.download = 'TegneData.json';
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

function fromImageData(imgPath, whereToPush) {
    var img = new Image();
    img.src = imgPath.img;
    img.onload = function () {
        // scale image
        img.width = img.width * imgPath.scale;
        img.height = img.height * imgPath.scale;
        if (whereToPush === 1) {
            pathsDrawn.push({ type: "img", img: img, room: curRoomName, scale: imgPath.scale, x: imgPath.x, y: imgPath.y });
            sendToAllPeers({ msgType: "img", img: img.src, room: curRoomName, scale: imgPath.scale, x: imgPath.x, y: imgPath.y });
        } else if (whereToPush === 2) {
            pathsUndone.push([{ type: "img", img: img, room: curRoomName, scale: imgPath.scale, x: imgPath.x, y: imgPath.y }]);
        }
        redrawCanvas();
    }
}


function load(e) {
    console.log("Loading file: ", e.target.files[0]);

    inInsertedImageMode = true;
    setBrush(undefined);
    defaultCursor = "wait";
    document.body.style.cursor = "wait";
    canvas.style.cursor = "wait";


    var file = e.target.files[0];
    if (file.type == "image/png" || file.type == "image/jpeg") {
        var reader = new FileReader();
        reader.onload = function (e) {
            console.log("Image loaded");
            var img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                let scale = scaleImage(img);
                pathsDrawn.push({ type: "img", img: img, room: curRoomName, scale: scale, 
                                  x: -canvasPosition.x, y: -canvasPosition.y });
                redrawCanvas();
                sendToAllPeers({ msgType: "img", img: img.src, room: curRoomName, scale: scale, x: 0, y: 0 });
            }
        }
        reader.readAsDataURL(file);
    } else if (file.type == "application/json" || file.type == "text/json") {
        var reader = new FileReader();
        reader.onload = function (e) {
            var data = JSON.parse(e.target.result);

            // convert img data to img
            data.pathsDrawn.filter(path => path.type === "img").forEach(path => {
                fromImageData(path, 1);
            });
            data.otherPeerPoints.filter(path => path.type === "img").forEach(path => {
                fromImageData(path, 1);
            });
            data.pathsUndone.forEach(paths => {
                paths.filter(path => path.type === "img").forEach(path => {
                    fromImageData(path, 2);
                });
            });

            let pd = data.pathsDrawn.filter(path => path.type !== "img");
            pd.forEach(path => path.room = curRoomName);
            let po = data.otherPeerPoints.filter(path => path.type !== "img");
            po.forEach(path => path.room = curRoomName);
            pathsDrawn = pathsDrawn.concat(pd, po);

            sendToAllPeers({ msgType: "paths", paths: pd });
            sendToAllPeers({ msgType: "paths", paths: po });


            let pu = data.pathsUndone.filter(paths => paths[0].type !== "img");
            pu.forEach(paths => paths[0].room = curRoomName);
            pathsUndone = pathsUndone.concat(pu);


            redrawCanvas();
        }
        reader.readAsText(file);
    } else {
        alert("Invalid file type");
    }

    defaultCursor = "default";
    document.body.style.cursor = "default";
    canvas.style.cursor = "default";
}

function scaleImage(img) {
    let scale = 1;
    // console.log("Scaling image: " + img.width + " x " + img.height + ", " + canvas.width + " x " + canvas.height);
    if (img.width > canvas.width || img.height > canvas.height) {
        console.log("Image too big, " + img.width + " x " + img.height + ", " + canvas.width + " x " + canvas.height);
        scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        img.width *= scale;
        img.height *= scale;
    }
    return scale;
}



function showPeerDrawings(element) {
    if (element.checked) {
        canvas2.style.display = "block";
    } else {
        canvas2.style.display = "none";
    }
}


function createRoom() {
    let newRoomName = document.getElementById("room-input").value;
    if (newRoomName === "") {
        alert("Skriv et navn på din nye tegning");
        return;
    }
    if (rooms.map(r => { return r.name }).includes(newRoomName)) {
        alert("Der findes allerede en tegning med dette navn, vælg et andet navn");
        document.getElementById("room-input").value = "";
        return;
    }

    let newRoom = { name: newRoomName, owner: myPeerId, peers: [] };

    addRoom(newRoom);
    sendToAllPeers({ msgType: "newRoom", room: newRoom });
    document.getElementById("room-input").value = "";
    updateRoomList()
}


function addRoom(roomToAdd, roomToAddPermissions, newOwner = false) {
    let existingRoom = rooms.find(r => { return r.name === roomToAdd.name });
    if (existingRoom === undefined) {
        rooms.push(roomToAdd);
        roomPermissions[roomToAdd.name] = true;
        peerConnections.forEach(conn => {
            let addPermission = true;
            try {
                addPermission = roomToAddPermissions[conn.peer][roomToAdd.name];
            } catch {
            }
            otherPeerPoints[conn.peer].showInRoom[roomToAdd.name] = addPermission;
        });
    } 
    // else if (roomToAdd.name === curRoomName) {
    //     console.log("Room already exists, adding peers to room")
    //     addAllToRoom(roomToAdd.peers, curRoomName);
    // }
    else {
        console.log(roomToAdd, otherPeerPoints);
        roomToAdd.peers.forEach(peer => {
            if (!existingRoom.peers.includes(peer)) {
                existingRoom.peers.push(peer);
                let addPermission = true;
                if (roomToAddPermissions[peer] !== undefined) {
                    addPermission = roomToAddPermissions[peer][roomToAdd.name];
                }
                if (peer !== myPeerId) {
                    otherPeerPoints[peer].showInRoom[roomToAdd.name] = addPermission;
                }
            }
            
        });

        if (newOwner) {
            existingRoom.owner = roomToAdd.owner;
        }
    }
}


function addAllToRoom(peersToAdd, roomName) {
    let newRoom = rooms.find(r => r.name === roomName);
    peersToAdd.forEach(peer => {
        if (!newRoom.peers.includes(peer) && peer !== myPeerId) {
            newRoom.peers.push(peer);
            if (roomName === curRoomName) {
                addToPeerList(peer, newRoom.owner);
            }
        }
    });
}




function changeRoom(newRoomName) {
    if (newRoomName === curRoomName) {
        return;
    }

    sendToAllPeers({ msgType: "changeRoom", toRoom: newRoomName, fromRoom: curRoomName });

    let newRoom = rooms.find(room => room.name === newRoomName);
    if (newRoom === undefined) {
        console.log("Room not found");
        return;
    }
    // if peer doesn't exist in room, add it
    if (!newRoom.peers.includes(myPeerId)) {
        newRoom.peers.push(myPeerId);
    }

    let curRoomObj = rooms.find(room => room.name === curRoomName);
    if (curRoomObj !== undefined) {
        let i = curRoomObj.peers.indexOf(myPeerId);
        if (i !== -1) {
            curRoomObj.peers.splice(i, 1);
        }
    }

    curRoomName = newRoomName;
    updatePeopleInRoom(newRoom);
    updateRoomList();
    redrawCanvas();
}


function updatePeopleInRoom(newRoom) {
    removeAllFromPeerList();
    newRoom.peers.forEach(peer => {
        if (peer === myPeerId) {
            document.getElementById('cb0').checked = roomPermissions[newRoom.name];
            if (newRoom.owner === myPeerId) {
                document.getElementsByClassName('peerName')[0].textContent = myPeerId + " (Dig, Ejer)"
            } else {
                document.getElementsByClassName('peerName')[0].textContent = myPeerId + " (Dig)"
            }
        } else {
            addToPeerList(peer, newRoom.owner);
        }
    });

    let disableableCbs = document.getElementsByClassName('disableable');
    let setCursorTo = newRoom.owner === myPeerId ? "default" : "not-allowed";
    for (let i = 0; i < disableableCbs.length; i++) {
        disableableCbs[i].style.cursor = setCursorTo;
    }

    // if (newRoom.owner !== myPeerId) {
    //     document.getElementById('showAllCheckbox').style.visibility = "hidden";
    // } else {
    //     document.getElementById('showAllCheckbox').style.display = "inline-block";
    // }
    
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


// (was) called from HTML
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


// called from HTML
function peerCheckbox(el) {
    let havePermission = rooms.filter(room => room.name === curRoomName)[0].owner === myPeerId;
    if (havePermission) {
        let peerName = "";
        if (el.id === "cb0") {
            roomPermissions[curRoomName] = el.checked;
            peerName = myPeerId;
        } else {
            peerName = el.parentElement.children[1].textContent;
            // take first 8 chars of peerName
            peerName = peerName.substring(0, peerIdLength);
            otherPeerPoints[peerName].showInRoom[curRoomName] = el.checked;
        }
        sendToAllPeers({ msgType: "showPeer", show: el.checked, peer: peerName, room: curRoomName });
    } else {
        el.checked = !el.checked;
    }
    redrawCanvas();
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


peer.on("close", () => {
    console.log("Connection to network was closed");
    document.querySelector('#status-text').textContent = "Mistet forbindelse til netværket";
})

peer.on("disconnected", () => {
    console.log("Connection to network lost");
    document.querySelector('#status-text').textContent = "Forbindelse til netværket blev lukket";
})

peer.on("error", (err) => {
    console.log(err);
    document.querySelector('#status-text').textContent = "Fejl under oprettelse af forbindelse";
})


peer.on("connection", (conn) => {
    console.log("connection made to " + conn.peer);
    document.querySelector('#status-text').textContent = "Oprettet forbindelse til " + conn.peer;



    // document.getElementById('cb0').checked = true;
    // let showPeerInRoom = {};
    // rooms.forEach(room => {
    //     showPeerInRoom[room.name] = true;
    // });

    // otherPeerPoints[conn.peer] = {
    //     showInRoom: showPeerInRoom,
    //     paths: []
    // };

    // if (peerConnections.length == 0) {
    //     rooms = [];
    //     // updateRoomList();
    // }



    // redrawPaths(false);
    // peerConnections.push(conn);
    conn.on("data", (data) => {
        // console.log(data.msgType);

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
                // TODO: Moving canvas while another is drawing, will delete drawing
                // until the other peer lets go of the mouse

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
                    // if (otherPeerPoints[conn.peer].showInRoom[curRoomName]) {
                    //     drawPath(path);
                    // }
                });
                redrawCanvas();
                break;
            
            case "deletePath":
                otherPeerPoints[conn.peer].paths.splice(data.pathIndex, 1);
                redrawCanvas();
                break;

            case "img":
                var img = new Image();
                img.src = data.img;
                img.onload = function () {
                    img.width = data.scale * img.width;
                    img.height = data.scale * img.height;
                    // console.log("received img: " + img);
                    otherPeerPoints[conn.peer].paths.push({ type: "img", img: img, room: data.room, 
                                                            scale: data.scale, x: data.x, y: data.y });
                    redrawCanvas();
                }
                break;

            case "moveImg":
                otherPeerPoints[conn.peer].paths[data.index].x = data.x;
                otherPeerPoints[conn.peer].paths[data.index].y = data.y;
                redrawCanvas();
                break;

            case "network":
                console.log(myPeerId + " received network from " + conn.peer + ":", data);
                console.log("data.rooms:", data.rooms);
                // if (data.peerList.length === 0 && peerConnections.length === 0) {
                //     addRoom({ name: firstPublicRoomName, owner: myPeerId, peers: [] })
                // }

                let pl = data.peerList.concat([conn.peer]);
                // console.log("pl:", pl)
                let toHigherPermissionNetwork = !data.toHigherPermissionNetwork; // && peerConnections.includes(conn.peer);
                // console.log("toHigherPermissionNetwork:", toHigherPermissionNetwork, "peerConnections:", peerConnections, "conn.peer:", conn.peer);

                let connPromises = [];
                pl.forEach(peerId => {
                    connPromises.push(onOpenConn(peerId, toHigherPermissionNetwork));
                });
                // wait for all promises to resolve
                Promise.all(connPromises).then(() => {
                    console.log(myPeerId + " - all connections made");
                    data.rooms.forEach(roomToAdd => {
                        addRoom(roomToAdd, data.roomPermissions, !data.toHigherPermissionNetwork);
                    });
                    
                    // console.log("rooms:", rooms);
                    // curRoomName = "Ingen valgt"
                    // changeRoom(rooms[0].name);
                    updatePeopleInRoom(rooms.find(room => { return room.name === curRoomName }));
                    updateRoomList();
                    
    
                    console.log("paths", data.paths);
                    data.paths.forEach(path => {
                        if (path.type === "img") {
                            let img = new Image();
                            img.src = path.img;
                            img.onload = function () {
                                img.width = path.scale * img.width;
                                img.height = path.scale * img.height;
                                path.img = img;
                                otherPeerPoints[conn.peer].paths.push(path);
                                drawPath(path);
                                redrawCanvas();
                            }
                        } else {
                            console.log(myPeerId + " - adding path:", path)
                            otherPeerPoints[conn.peer].paths.push(path);
                            // drawPath(path);
                        }
                    });
                    redrawCanvas();
                });



                break;

            case "undo":
                otherPeerPoints[conn.peer].paths.pop();
                redrawCanvas();
                break;

            case "clear":
                otherPeerPoints[conn.peer].paths = [];
                redrawCanvas();
                break;

            case "newRoom":
                addRoom(data.room);
                updateRoomList();
                break;

            case "showPeer":
                if (data.peer === myPeerId) {
                    roomPermissions[data.room] = data.show;
                    // document.getElementById('cb0').checked = data.show;
                } else {
                    otherPeerPoints[data.peer].showInRoom[data.room] = data.show;
                }
                if (data.room === curRoomName) {
                    // update peerItem
                    let PeerItems = document.getElementsByClassName('peerItem')
                    for (let i = 0; i < PeerItems.length; i++) {
                        if (PeerItems[i].children[1].textContent.substring(0, peerIdLength) === data.peer) {
                            PeerItems[i].children[0].checked = data.show;
                        }
                    }
                }
                redrawCanvas();
                break;

            case "changeRoom":
                // rooms.find(room => room.name === data.toRoom).peers.push(conn.peer);
                let oldRoomList = rooms.find(room => room.name === data.fromRoom);
                if (oldRoomList !== undefined) {
                    let i = oldRoomList.peers.indexOf(conn.peer);
                    if (i !== -1) {
                        oldRoomList.peers.splice(i, 1);
                    }
                }

                addAllToRoom([conn.peer], data.toRoom);

                if (data.fromRoom === curRoomName) {
                    // remove from peerList
                    // let PeerItems = document.getElementsByClassName('peerItem')
                    // for (let i = 0; i < PeerItems.length; i++) {
                    //     if (PeerItems[i].children[1].textContent === conn.peer) {
                    //         PeerItems[i].remove();
                    //     }
                    // }
                    updatePeopleInRoom(rooms.find(room => room.name === data.fromRoom));
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



// peer.on("disconnected", () => {
//     console.log("disconnected");
//     reconnectTimeout = setTimeout(tryReconnecting, 1000);
// });



