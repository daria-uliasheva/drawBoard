function init(ctx) {
    var
        totalCanvas = document.createElement("canvas"),
        totalCtx = totalCanvas.getContext("2d"),
        canvas = ctx.canvas,
        infinityCtx = {
            position: { x: 0, y: 0 },
            canvas: canvas, ctx: ctx, parts: {},
            configuration: {
                partW: 500,
                partH: 500,
                debugMode: false
            }
        };

    totalCanvas.width = infinityCtx.configuration.partW;
    totalCanvas.height = infinityCtx.configuration.partH;

    var socket = io();
    socket.on("draw", function (data) {
        var
            dX = inf_ctx.position.x,
            dY = inf_ctx.position.y,
            newDrawPosX = data.newdrawPosX - dX,
            newDrawPosY = data.newdrawPosY - dY,
            prevDrawPosX = data.prevDrawPosX - dX,
            prevDrawPosY = data.prevDrawPosY - dY;

        if (!(newDrawPosX >= 0 && newDrawPosX <= inf_ctx.canvas.width &&
            newDrawPosY >= 0 && newDrawPosY <= inf_ctx.canvas.height &&
            prevDrawPosX >= 0 && prevDrawPosX <= inf_ctx.canvas.width &&
            prevDrawPosY >= 0 && prevDrawPosY <= inf_ctx.canvas.height)) {
            updateOffScreen(data);
            //moveBy(0, 0);
        }
    });
    //socket.on("saveData", (flag) => { if (flag) socket.emit("saveData", infinityCtx.parts); })
    /*socket.on("saveData", (flag) => {
        if (flag)
            Object.keys(infinityCtx.parts).forEach(function (key) {
                socket.emit("saveData", { src: infinityCtx.parts[key].src, key: key });
            })
    });*/
    /*socket.on("restoreData", (data) => {
        if (!infinityCtx.parts[data.key]) {
            infinityCtx.parts[data.key] = new Image(infinityCtx.configuration.partW, infinityCtx.configuration.partH);
        }
        infinityCtx.parts[data.key].src = data.src;
        infinityCtx.moveBy(0, 0);
    });*/
    function updateOffScreen(data) {
        var
            newDrawPosX = data.newDrawPosX,
            newDrawPosY = data.newDrawPosY,
            prevDrawPosX = data.prevDrawPosX,
            prevDrawPosY = data.prevDrawPosY;
        var
            tx = Math.floor(newDrawPosX / infinityCtx.configuration.partW),
            ty = Math.floor(newDrawPosY / infinityCtx.configuration.partH),
            partKey = tx.toString() + ", " + ty.toString();

        var split = partKey.split(", "),
            coord = { x: parseInt(split[0]), y: parseInt(split[1]) },
            partWorldCoord = {
                x: coord.x * infinityCtx.configuration.partW,
                y: coord.y * infinityCtx.configuration.partH
            };

        totalCtx.clearRect(0, 0, infinityCtx.configuration.partW, infinityCtx.configuration.partH);
        if (!infinityCtx.parts[partKey]) {
            infinityCtx.parts[partKey] = new Image(infinityCtx.configuration.partW, infinityCtx.configuration.partH);
        }
        if (infinityCtx.parts[partKey].src) { totalCtx.drawImage(infinityCtx.parts[partKey], 0, 0); }

        //totalCtx.clearRect(0, 0, infinityCtx.configuration.partW, infinityCtx.configuration.partH);

        totalCtx.beginPath();
        totalCtx.moveTo(prevDrawPosX - partWorldCoord.x, prevDrawPosY - partWorldCoord.y);
        totalCtx.lineTo(newDrawPosX - partWorldCoord.x, newDrawPosY - partWorldCoord.y);
        totalCtx.strokeStyle = data.lineColor;
        totalCtx.lineWidth = data.lineWidth;
        totalCtx.lineCap = "round";
        totalCtx.stroke();

        totalCtx.strokeStyle = "black";
        totalCtx.lineWidth = 1;
        if (infinityCtx.configuration.debugMode) {
            totalCtx.strokeRect(0, 0, infinityCtx.configuration.partW, infinityCtx.configuration.partH);
            totalCtx.fillText(partKey, infinityCtx.configuration.partW / 2, infinityCtx.configuration.partH / 2);
        }
        infinityCtx.parts[partKey].src = totalCtx.canvas.toDataURL();
        totalCtx.clearRect(0, 0, infinityCtx.configuration.partW, infinityCtx.configuration.partH);
    }

    function partsRender(parts) {
        Object.keys(parts).forEach(function (key) {
            var
                split = key.split(", "),
                coord = { x: parseInt(split[0]), y: parseInt(split[1]) },
                renderCoordinate = {
                    x: (coord.x * infinityCtx.configuration.partW) - infinityCtx.position.x,
                    y: (coord.y * infinityCtx.configuration.partH) - infinityCtx.position.y
                };

            try {
                ctx.drawImage(infinityCtx.parts[key], renderCoordinate.x, renderCoordinate.y);
            } catch (error) {
                if (error.name != "NS_ERROR_NOT_AVAILABLE") {
                    throw error;
                }
            }
        });
    }

    function getViewportParts() {
        var
            partsInViewport = {},
            top_left = {
                x: Math.floor(infinityCtx.position.x / infinityCtx.configuration.partW),
                y: Math.floor(infinityCtx.position.y / infinityCtx.configuration.partH)
            },
            bottom_right = {
                x: Math.floor((infinityCtx.position.x + canvas.width) / infinityCtx.configuration.partW),
                y: Math.floor((infinityCtx.position.y + canvas.height) / infinityCtx.configuration.partH)
            },
            NumOfXParts = Math.abs(top_left.x - bottom_right.x),
            NumOfYParts = Math.abs(top_left.y - bottom_right.y);

        for (var x = 0; x <= NumOfXParts; x++) {
            for (var y = 0; y <= NumOfYParts; y++) {
                var
                    tx = top_left.x + x, ty = top_left.y + y;
                var partKey = tx.toString() + ", " + ty.toString();
                if (!infinityCtx.parts[partKey]) {
                    infinityCtx.parts[partKey] = new Image(infinityCtx.configuration.partW, infinityCtx.configuration.partH);
                }

                partsInViewport[partKey] = infinityCtx.parts[partKey];
            }
        }

        return partsInViewport;
    }

    infinityCtx.partsUpdate = function () {
        var parts = getViewportParts();

        Object.keys(parts).forEach(function (key) {
            var
                split = key.split(", "),
                coord = { x: parseInt(split[0]), y: parseInt(split[1]) },
                renderCoord = {
                    x: (coord.x * infinityCtx.configuration.partW) - infinityCtx.position.x,
                    y: (coord.y * infinityCtx.configuration.partH) - infinityCtx.position.y
                },
                partWorldCoord = {
                    x: coord.x * infinityCtx.configuration.partW,
                    y: coord.y * infinityCtx.configuration.partH
                },
                partSourceCoord = {
                    x: Math.max(renderCoord.x, 0),
                    y: Math.max(renderCoord.y, 0)
                },
                width = Math.min(renderCoord.x + infinityCtx.configuration.partW, canvas.width) - partSourceCoord.x,
                height = Math.min(renderCoord.y + infinityCtx.configuration.partH, canvas.height) - partSourceCoord.y,
                putLocation = { x: infinityCtx.configuration.partW - width, y: infinityCtx.configuration.partH - height };

            if (height <= 0 || width <= 0) return;





            if (partWorldCoord.x >= infinityCtx.position.x) { putLocation.x = 0; }
            if (partWorldCoord.y >= infinityCtx.position.y) { putLocation.y = 0; }

            if (parts[key].src) { totalCtx.drawImage(parts[key], 0, 0); }

            totalCtx.clearRect(putLocation.x, putLocation.y, width, height);
            totalCtx.drawImage(canvas, partSourceCoord.x, partSourceCoord.y, width, height, putLocation.x, putLocation.y, width, height);
            if (infinityCtx.configuration.debugMode) {
                totalCtx.strokeRect(0, 0, infinityCtx.configuration.partW, infinityCtx.configuration.partH);
                totalCtx.fillText(key, infinityCtx.configuration.partW / 2, infinityCtx.configuration.partH / 2);
            }
            infinityCtx.parts[key].src = totalCtx.canvas.toDataURL();
            totalCtx.clearRect(0, 0, infinityCtx.configuration.partW, infinityCtx.configuration.partH);
        });
    };

    infinityCtx.moveBy = function (dx, dy, isRender) {
        infinityCtx.position.x += dx;
        infinityCtx.position.y += dy;


        isRender = isRender === undefined ? true : isRender;
        if (isRender) partsRender(getViewportParts());
    };

    infinityCtx.moveTo = function (x, y, isRender) {
        infinityCtx.position.x = x;
        infinityCtx.position.y = y;


        isRender = isRender === undefined ? true : isRender;
        if (isRender) partsRender(getViewportParts());
    };

    infinityCtx.partLoad = function (key, part) {
        infinityCtx.parts[key] = part;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        partsRender(getViewportParts());
    };

    return infinityCtx;
}

window.infiniteCanvas = {
    init: init
};