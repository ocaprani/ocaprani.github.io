


let cellWidth = 30;
let cellHeight = 30;

coordBoxColor = "rgb(225, 225, 225)";

function drawGrid(x, y) {
    context.strokeStyle = "black";
    context.lineWidth = 0.25;
    context.beginPath();
    for (let i = 0; i < canvas.width; i += cellWidth) {
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height);
    }
    for (let i = 0; i < canvas.height; i += cellHeight) {
        context.moveTo(0, i);
        context.lineTo(canvas.width, i);
    }
    context.stroke();
    
    // Draw axis ticks
    context.lineWidth = 1;
    let cellsPerTick = 2;
    context.beginPath();
    for (let i = cellWidth; i < canvas.width; i += cellWidth*cellsPerTick) {
        context.moveTo(i, canvas.height / 2 - 5);
        context.lineTo(i, canvas.height / 2 + 5);
    }

    for (let i = cellWidth; i < canvas.height; i += cellHeight*cellsPerTick) {
        context.moveTo(canvas.width / 2 - 5, i);
        context.lineTo(canvas.width / 2 + 5, i);
    }


    // Draw axes with arrows at both ends
    // context.lineWidth = 1;
    // context.beginPath();

    // x axis
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    // x axis right arrow
    context.moveTo(canvas.width, canvas.height / 2);
    context.lineTo(canvas.width - 10, canvas.height / 2 - 5);
    context.moveTo(canvas.width, canvas.height / 2);
    context.lineTo(canvas.width - 10, canvas.height / 2 + 5);
    // x axis left arrow
    // context.moveTo(0, canvas.height / 2);
    // context.lineTo(10, canvas.height / 2 - 5);
    // context.moveTo(0, canvas.height / 2);
    // context.lineTo(10, canvas.height / 2 + 5);
    // y axis
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    // y axis top arrow
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2 - 5, 10);
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2 + 5, 10);
    // y axis bottom arrow
    // context.moveTo(canvas.width / 2, canvas.height);
    // context.lineTo(canvas.width / 2 - 5, canvas.height - 10);
    // context.moveTo(canvas.width / 2, canvas.height);
    // context.lineTo(canvas.width / 2 + 5, canvas.height - 10);
    
    // Type the current xy coordinates
    if (x !== undefined && y !== undefined){
        // Fill the background of the text with same color as canvas background
        // context.fillStyle = canvasColor;
        context.fillStyle = coordBoxColor;
        context.fillRect(canvas.width - 64, canvas.height / 2 + 13, 63, 25);
        context.fillRect(canvas.width / 2 + 11, 3, 62, 25);
        
        // Draw the text
        context.font = "16px Arial";
        context.fillStyle = "black";
        context.fillText(`x: ${x - canvas.width / 2}`, canvas.width - 60, canvas.height / 2 + 30);
        context.fillText(`y: ${-(y - canvas.height / 2)}`, canvas.width / 2 + 14, 20);

    }
    
    context.stroke();
}





