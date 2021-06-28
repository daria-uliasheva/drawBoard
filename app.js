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
io.on('connection', function (socket) {
    console.log('a user conected: ' + socket.request.connection.remoteAddress);
    socket.on(eventNames.draw, function (data) {
        socket.broadcast.emit(eventNames.draw, data);
    });
    socket.on(eventNames.stopDraw, function (data) {
        io.emit(eventNames.stopDraw, data);
    });
});

http.listen(process.env.PORT || 3000, function () {
    console.log('listening on *:3000');
});
