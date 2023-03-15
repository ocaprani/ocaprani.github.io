// connect with peerjs on button press
/* const connect = () => {
    
    const peer = new Peer();
    
    peer.on('open', id => {
    
    console.log('My peer ID is: ' + id);
    
    });
    
} */
// const button = document.getElementById('connect-btn');
// button.addEventListener('click', () => {
//     console.log('Trying to connect...');
//     document.getElementById('status-text').innerText = 'Connecting...';
// });




const TESTING = true;

if (TESTING) {
    if (location.hash === '#1') {
        id = "peer1"
        document.querySelector('#connect-input').value = "peer0";
    } else {
        id = "peer0"
        document.querySelector('#connect-input').value = "peer1";
    }
} else {
    id = Math.random().toString().slice(2,5);
    document.querySelector('#status-text').textContent = id
}


const peer = new Peer(id);

var conn = null;
document.querySelector('#connect-btn').addEventListener('click', () => {
    conn = peer.connect(document.querySelector('#connect-input').value);
    conn.on("open", () => {
        console.log("connection opened");
        // conn.send("hi!");
        document.querySelector('#status-text').textContent = "Connected";
    });
    
})





var canvasArea = {
    canvas: document.querySelector('#canvas'),
    // localNowDrawing: true,
    init: function () {
        const div = document.querySelector('#canvas-div')
        this.canvas.width = div.clientWidth;
        this.canvas.height = div.clientHeight - 2;
        this.context = this.canvas.getContext("2d");
        this.localNowDrawing = false;
        

        // context.fillStyle = '#000000';
        // context.fillRect(0, 0, width, height);

        this.interval = setInterval(updateCanvas, 20);
        this.canvas.addEventListener('mousedown', function (e) {
            this.boundingRect = e.target.getBoundingClientRect();
            strokeColor = e.clientX - this.boundingRect.left;
            strokeWidth = e.clientY - this.boundingRect.top;
            console.log("mouse down");
            this.localNowDrawing = true;
            console.log(this.localNowDrawing);
            this.drawPositionX = strokeColor;
            this.drawPositionY = strokeWidth;
        });
        this.canvas.addEventListener('mouseup', function (e) {
            console.log("mouse up");
            this.localNowDrawing = false;
        });
        this.canvas.addEventListener('touchstart', function (e) {
            strokeColor = e.touches[0].clientX - this.boundingRect.left;
            strokeWidth = e.touches[0].clientY - this.boundingRect.top;
            this.localNowDrawing = true;
            this.drawPositionX = strokeColor;
            this.drawPositionY = strokeWidth;
        //     this.x = e.pageX;
        //     this.y = e.pageY;
        });
        this.canvas.addEventListener('touchend', function (e) {
            console.log("touch end");
            this.localNowDrawing = false;
        //     this.x = false;
        //     this.y = false;
        });
    },
    // move: function () {
        
    // },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // updateCanvas: function () {
    //     // canvasArea.clear();
    //     console.log(canvasArea.localNowDrawing);
    //     // this.localNowDrawing = true;
    //     if (this.localNowDrawing) {
    //         console.log("updating canvas");
    //         this.context.beginPath();
    //         this.context.moveTo(this.drawPositionX, this.drawPositionY);
    //         this.context.lineTo(this.x, this.y);
    //         this.context.strokeStyle = 'black';
    //         this.context.lineWidth = 2;
    //         this.context.stroke();
    //         this.drawPositionX = this.x;
    //         this.drawPositionY = this.y;
    //     }
    //     if (conn) {
    //         conn.send({
    //             x: this.x,
    //             y: this.y,
    //             nowDrawing: this.localNowDrawing,
    //             drawPositionX: this.drawPositionX,
    //             drawPositionY: this.drawPositionY
    //         });
    //     };
    // }
    
}


canvasArea.init();
console.log(canvasArea.localNowDrawing);

function updateCanvas(){
    // console.log(canvasArea.drawPositionX);
    // this.localNowDrawing = true;
    if (canvasArea.localNowDrawing) {
        console.log("updating canvas");
        canvasArea.context.beginPath();
        canvasArea.context.moveTo(canvasArea.drawPositionX, canvasArea.drawPositionY);
        canvasArea.context.lineTo(canvasArea.x, canvasArea.y);
        canvasArea.context.strokeStyle = 'black';
        canvasArea.context.lineWidth = 2;
        canvasArea.context.stroke();
        canvasArea.drawPositionX = canvasArea.x;
        canvasArea.drawPositionY = canvasArea.y;
    }
    if (conn) {
        conn.send({
            x: canvasArea.x,
            y: canvasArea.y,
            nowDrawing: canvasArea.localNowDrawing,
            drawPositionX: canvasArea.drawPositionX,
            drawPositionY: canvasArea.drawPositionY
        });
    };
}




peer.on("connection", (conn_1) => {
    conn_1.on("data", (data) => {
        console.log(data);
        canvasArea.x = data.x;
        canvasArea.y = data.y;
        canvasArea.localNowDrawing = data.nowDrawing;
        canvasArea.drawPositionX = data.drawPositionX;
        canvasArea.drawPositionY = data.drawPositionY;
        
    });
    conn_1.on("open", () => {
        console.log("connection opened");
        conn_1.send("hello!");
    });
});






/*

// https://www.w3schools.com/graphics/tryit.asp?filename=trygame_controllers_buttons
var myGamePiece;
var myUpBtn;
var myDownBtn;
var myLeftBtn;
var myRightBtn;
function startGame() {
    myGamePiece = new component(30, 30, "red", 10, 120);
    myUpBtn = new component(30, 30, "blue", 50, 10);
    myDownBtn = new component(30, 30, "blue", 50, 70);
    myLeftBtn = new component(30, 30, "blue", 20, 40);
    myRightBtn = new component(30, 30, "blue", 80, 40);
    myMiddleBtn = new component(30, 30, "green", 50, 40);
    myGameArea.start();
}
var myGameArea = {
    // canvas : document.createElement("canvas"),
    canvas: document.querySelector('#canvas'),
    start: function () {
        const div = document.querySelector('#canvas-div')
        this.canvas.width = div.clientWidth;
        this.canvas.height = div.clientHeight - 2;
        this.context = this.canvas.getContext("2d");
        // document.body.insertBefore(this.canvas, document.body.childNodes[5]);
        // insert this.canvas in div with id #canvas-div
        // document.getElementById('canvas-div').appendChild(this.canvas);
        // var canvas_element = document.getElementById('canvas')


        this.interval = setInterval(updateGameArea, 20);
        this.canvas.addEventListener('mousedown', function (e) {
            var rect = e.target.getBoundingClientRect();
            var x = e.clientX - rect.left; //x position within the element.
            var y = e.clientY - rect.top;  //y position within the element.
            myGameArea.x = x;
            myGameArea.y = y;
        });
        this.canvas.addEventListener('mouseup', function (e) {
            myGameArea.x = false;
            myGameArea.y = false;
        });
        // this.canvas.addEventListener('touchstart', function (e) {
        //     myGameArea.x = e.pageX;
        //     myGameArea.y = e.pageY;
        // });
        // this.canvas.addEventListener('touchend', function (e) {
        //     myGameArea.x = false;
        //     myGameArea.y = false;
        // });
    },
    clear: function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
};

function component(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function () {
        ctx = myGameArea.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    this.clicked = function () {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var clicked = true;
        if ((mybottom < myGameArea.y) || (mytop > myGameArea.y) || (myright < myGameArea.x) || (myleft > myGameArea.x)) {
            clicked = false;
        }
        return clicked;
    };
}
function updateGameArea() {
    myGameArea.clear();
    if (myGameArea.x && myGameArea.y) {
        var changed = true;
        if (myUpBtn.clicked()) {
            myGamePiece.y -= 1;
        }
        else if (myDownBtn.clicked()) {
            myGamePiece.y += 1;
        }
        else if (myLeftBtn.clicked()) {
            myGamePiece.x += -1;
        }
        else if (myRightBtn.clicked()) {
            myGamePiece.x += 1;
        }
        else if (myMiddleBtn.clicked()) {
            console.log("middle clicked")
        }
        else {
            changed = false
        }
        if (changed) {
            if (conn != null) {
                conn.send([myGamePiece.x, myGamePiece.y]);
            }
        }
    }
    myUpBtn.update();
    myDownBtn.update();
    myLeftBtn.update();
    myRightBtn.update();
    myMiddleBtn.update();
    myGamePiece.update();
}

startGame();


peer.on("connection", (conn_1) => {
    conn_1.on("data", (data) => {
        // console.log("received: " + data.toString());
        // document.querySelector('#outgoing').textContent = data
        myGamePiece.x = data[0];
        myGamePiece.y = data[1];
        
    });
    conn_1.on("open", () => {
        console.log("connection opened");
        conn_1.send("hello!");
    });
});


*/
