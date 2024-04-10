


let cellWidth = 25;
let cellHeight = 25;

function drawGrid() {
    context.strokeStyle = "black";
    context.lineWidth = 0.25;
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

    // Draw axis ticks
    context.lineWidth = 1;
    let cellsPerTick = 2;
    for (let i = cellWidth; i < canvas.width; i += cellWidth*cellsPerTick) {
        context.beginPath();
        context.moveTo(i, canvas.height / 2 - 5);
        context.lineTo(i, canvas.height / 2 + 5);
        context.stroke();
    }

    for (let i = cellWidth; i < canvas.height; i += cellHeight*cellsPerTick) {
        context.beginPath();
        context.moveTo(canvas.width / 2 - 5, i);
        context.lineTo(canvas.width / 2 + 5, i);
        context.stroke();
    }

    // Draw axes with arrows at both ends
    context.lineWidth = 1;
    context.beginPath();
    // x axis
    context.moveTo(0, canvas.height / 2);
    context.lineTo(canvas.width, canvas.height / 2);
    // x axis right arrow
    context.moveTo(canvas.width, canvas.height / 2);
    context.lineTo(canvas.width - 10, canvas.height / 2 - 5);
    context.moveTo(canvas.width, canvas.height / 2);
    context.lineTo(canvas.width - 10, canvas.height / 2 + 5);
    // x axis left arrow
    context.moveTo(0, canvas.height / 2);
    context.lineTo(10, canvas.height / 2 - 5);
    context.moveTo(0, canvas.height / 2);
    context.lineTo(10, canvas.height / 2 + 5);
    // y axis
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    // y axis top arrow
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2 - 5, 10);
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2 + 5, 10);
    // y axis bottom arrow
    context.moveTo(canvas.width / 2, canvas.height);
    context.lineTo(canvas.width / 2 - 5, canvas.height - 10);
    context.moveTo(canvas.width / 2, canvas.height);
    context.lineTo(canvas.width / 2 + 5, canvas.height - 10);
    context.stroke();



    


}





