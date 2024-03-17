


let cellWidth = 50;
let cellHeight = 50;

function drawGrid() {
    context.strokeStyle = "black";
    context.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += cellWidth) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
        context.stroke();
    }
    for (let i = 0; i < canvas.height; i += cellHeight) {
        context.beginPath();
        context.moveTo(0, i);
        context.lineTo(canvas.width, i);
        context.stroke();
    }

}





