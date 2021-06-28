var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

var eventNames = {
    draw: 'draw',
    stopDraw: 'stopDraw'
};

var serverPartsSrc = {};
var flag = false;

io.on('connection', function (socket) {
    console.log('a user conected: ' + socket.request.connection.remoteAddress);
    /*Object.keys(infinityCtx.parts).forEach(function (key) {
        socket.emit("restoreData", { src: serverPartsSrc[key], key: key });
    })*/

    //console.log('data restore: ' + socket.request.connection.remoteAddress);
    socket.on(eventNames.draw, function (data) {
        socket.broadcast.emit(eventNames.draw, data);
        //flag = true;
    });
    socket.on(eventNames.stopDraw, function (data) {
        io.emit(eventNames.stopDraw, data);
    });
    /*    socket.on("saveData", (data) => {
            flag = false;
            serverPartsSrc[data.key] = data.src;
            console.log(serverPartsSrc[data.key]);
        })*/
});

//setInterval(() => { io.emit("saveData", { flag: flag }) }, 1000);

http.listen(process.env.PORT || 3000, function () {
    console.log('listening on *:3000');
});
