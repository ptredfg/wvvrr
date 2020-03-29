import io from 'socket.io-client';
 
const socket = io();

let id = Math.floor(Math.random() * 100000000);
let lastX = null;
let lastY = null;
let color = "#000000";

const canvasWidth = 1500;
const canvasHeight = 1000;

const canvas = document.querySelector("#canvas");
const context2D = canvas.getContext( "2d" );
const img = document.createElement( "img" );
img.addEventListener( "load", function () {

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    if ( ! context2D ) return;

    context2D.clearRect( 0, 0, canvas.width, canvas.height );

    var ptrn = context2D.createPattern(img, 'repeat'); // Create a pattern with this image, and set it to "repeat".
    context2D.fillStyle = ptrn;
    context2D.fillRect(0, 0, canvas.width, canvas.height); 

}, false );
img.crossOrigin = '';
img.src = require("./components/whiteboard_pattern.jpg").default;

socket.on('remoteDraw', (remoteDrawObject) => {
    if (remoteDrawObject.id != id) {
        drawRemote(remoteDrawObject);
    }
});


canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);

function drawRemote(remoteDrawObject) {
    if (remoteDrawObject.lastX != null && remoteDrawObject.lastY != null) {            
        context2D.beginPath();
        context2D.strokeStyle = remoteDrawObject.color;
        context2D.lineJoin = 'round';
        context2D.lineWidth = 10;
        context2D.moveTo(remoteDrawObject.lastX, remoteDrawObject.lastY);
        context2D.lineTo(remoteDrawObject.x, remoteDrawObject.y);
        context2D.closePath();
        context2D.stroke();
        
    }
}

function draw (x, y) {
    if (lastX != null && lastY != null) {
        console.log({x,y});
        
        var drawObject= {};
        drawObject.id = id;
        drawObject.lastX = lastX;
        drawObject.lastY = lastY;
        drawObject.x = x;
        drawObject.y = y;
        drawObject.color = color;
        socket.emit('draw', drawObject);
        drawRemote(drawObject);
        lastX = x;
        lastY = y;
    }
}

function onMouseMove( evt ) {

    evt.preventDefault();

    let scalingX = canvasWidth / canvas.clientWidth;
    let scalingY = canvasHeight / canvas.clientHeight;

    let x = (evt.pageX - canvas.offsetLeft) * scalingX;
    let y = (evt.pageY - canvas.offsetTop) * scalingY;
    draw(x,y);

}
function onMouseDown (evt) {
    let scalingX = canvasWidth / canvas.clientWidth;
    let scalingY = canvasHeight / canvas.clientHeight;

    lastX = (evt.pageX - canvas.offsetLeft) * scalingX;
    lastY = (evt.pageY - canvas.offsetTop) * scalingY;
}
function onMouseUp (evt) {
    lastX = null;
    lastY = null;
}

window.addEventListener('resize', evt => {
    canvas.style.width = "100%";
    const height = canvas.clientWidth / 1.5;
    if (height > window.innerHeight) {
        canvas.style.height = window.innerHeight - 100 + "px";
        canvas.style.width = canvas.clientHeight / 0.66 + "px";
    } else {
        canvas.style.height = canvas.clientWidth / 1.5 + "px";
    }
})