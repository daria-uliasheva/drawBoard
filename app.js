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
        io.emit(eventNames.draw, data);
        flag = true;
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

http.listen(3000, "192.168.30.22", function () {
    console.log('listening on 192.168.30.22:3000');
});

/*
Чтобы запустить локальный экземпляр , вам нужно настроить внутреннего сервера и клиента.
необходимо иметь node.js, установить socket.io, Express и все другие необходимые модули Node
Сервер дает пользователям возможность обмена информацией,
такой как команды рисования и стили линий.
После подключения к серверу
пользователи автоматически начинают получать обновления, относящиеся к приложению для рисования.
Например, пользователь может получить обновление, такое как: «нарисована линия от (40, 23) до (47, 19)».

Есть возможность запустить локальный экземпляр
... позволяет
цифровой холст
с возможностью совместного рисования в реальном времени
доска
созранить работу в виде графического
*/