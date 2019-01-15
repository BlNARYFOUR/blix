"use strict";


const COLOR = {
    background: "#143642",
    tile: {
        empty: {foreground: "#335C6E", background: "#012534"},
        red: {foreground: "#B7173F", background: "#7A1730"},
        green: {foreground: "#009A13", background: "#004E0A"},
        yellow: {foreground: "#E7CC19", background: "#82730E"},
        blue: {foreground: "#4363D8", background: "#2E4492"},
        orange: {foreground: "#F6771E", background: "#A94600"},
        purple: {foreground: "#911EB4", background: "#5F1575"},
        cyan: {foreground: "#3EC3E0", background: "#006176"},
        magenta: {foreground: "#F722EC", background: "#8D1987"},
        lime: {foreground: "#97CC0F", background: "#5B7A0E"},
        pink: {foreground: "#FFACAC", background: "#A55A5A"},
        teal: {foreground: "#19BEAC", background: "#106D63"},
        brown: {foreground: "#B56407", background: "#734006"},
        beige: {foreground: "#DAD068", background: "#706C39"},
        mint: {foreground: "#40D26B", background: "#27793F"},
        olive: {foreground: "#AEAE00", background: "#6B6B03"},
        apricot: {foreground: "#FFAD5D", background: "#885D33"},
        navy: {foreground: "#1818A9", background: "#111159"}
    }
};

const FPS = 60;

const MAP_SIZE = 200;
const HOR_VIEW_TILES = 44;

let keys = {
    z: goUp,
    s: goDown,
    q: goLeft,
    d: goRight,
    ArrowUp: goUp,
    ArrowDown: goDown,
    ArrowLeft: goLeft,
    ArrowRight: goRight,
    p: pause
};

let myId = 3;
let players = [new Player(), new Player(), new Player(), new Player()];
players[myId].x = 9;
players[myId].y = 9;
players[1].x = 6;
players[1].y = 2;
//players[1].movementX = 1;
for (let i = 0; i < players.length; i++) {
    players[i].id = i;
}

let paused = false;


let playingField;

let canvasPlayingField;
let contextPlayingField;
let playingFieldHeight;
let playingFieldWidth;

let tileSize;

let frameInterval;
let mouseTimeout;


document.addEventListener("DOMContentLoaded", init);


function init(e) {
    e.preventDefault();

    startGame();
}

function startGame() {
    createPlayingField();
    players[myId].movementX = 1;
    resize();

    players.forEach(player => mockSpawnTile(player));

    startAnimation();

    window.addEventListener("resize", resize);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener("mousemove", hideMouse);
    hideMouse();
}

function hideMouse(e) {
    clearTimeout(mouseTimeout);

    document.querySelector("body").style.cursor = "auto";

    mouseTimeout = setTimeout(function () {
        document.querySelector("body").style.cursor = "none";
    }, 1500);
}

function startAnimation() {
    frameInterval = setInterval(() => {
        frame(FPS)
    }, 1000 / FPS);
}

function drawEverythingOnPlayingField() {
    initCanvasPlayingField();
    updateTiles();
    contextPlayingField.clearRect(0, 0, playingFieldWidth, playingFieldHeight);
    drawPlayingField();
    drawTail();
    players.forEach(player => {
        if(!player.isDead) {
            drawHead(player);
        }
    });
}

function initCanvasPlayingField() {
    canvasPlayingField = document.getElementById("playingField");
    contextPlayingField = canvasPlayingField.getContext("2d");
    //playingFieldHeight = window.innerHeight;
    //playingFieldWidth = window.innerWidth;
    playingFieldHeight = document.documentElement.clientHeight * 3;
    playingFieldWidth = document.documentElement.clientWidth * 3;
    canvasPlayingField.height = playingFieldHeight;
    canvasPlayingField.width = playingFieldWidth;

    tileSize = playingFieldWidth / HOR_VIEW_TILES;
}

function resize(e) {
    //console.log(window.innerWidth);
    initCanvasPlayingField();
    updateTiles();
    drawEverythingOnPlayingField();
}

function createPlayingField() {
    playingField = new Array(0);

    for (let i = 0; i < MAP_SIZE; i++) {
        playingField.push(new Array(0));

        for (let j = 0; j < MAP_SIZE; j++) {
            playingField[i].push(new Tile(true, COLOR.tile.empty));
        }
    }
}

function Player() {
    this.isDead = false;
    this.name = "John Doe";
    this.id = 0;
    this.x = 1;
    this.y = 1;
    this.prevMovementX = 0;
    this.prevMovementY = 0;
    this.movementX = 0;
    this.movementY = 0;
    this.score = 0;
    this.kills = 0;
    this.barrier = {
        onOwnField: true,
        maxPoint: {
            x: -1,
            y: -1
        },
        minPoint: {
            x: MAP_SIZE,
            y: MAP_SIZE
        },
        beginPoint: {
            x: 0,
            y: 0
        },
        endPoint: {
            x: 0,
            y: 0
        },
        beginDirection: {
            x: 0,
            y: 0
        },
        endDirection: {
            x: 0,
            y: 0
        }
    };
}

function Square(size, color, x, y) {
    this.size = size;
    this.color = color;
    this.x = x;
    this.y = y;
}

function Rectangle(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.color = color;
    this.x = x;
    this.y = y;
}

function Tile(isSmall, tileColor) {
    this.occupier = null;
    this.new = false;
    this.barrier = null;
    this.linked = [null, null]; //0: right, 1: down, 2: left, 3: left
    this.isSmall = isSmall;
    this.color = tileColor;

    setTileSize(this);
}

function setTileSize(tile) {
    if (tile.isSmall) {
        tile.foregroundSquare = new Square(
            tileSize * 36 / 48,
            tile.color.foreground,
            tileSize * 4 / 48,
            tileSize * 4 / 48
        );

        tile.backgroundSquare = new Square(
            tileSize * 36 / 48,
            tile.color.background,
            tile.foregroundSquare.x + tileSize * 5 / 48,
            tile.foregroundSquare.x + tileSize * 5 / 48
        );
    } else {
        // 48 TileWidth, 43 mainSquareWidth, pos: 0, 0
        tile.foregroundSquare = new Square(
            tileSize * 43 / 48,
            tile.color.foreground,
            0,
            0
        );

        tile.backgroundSquare = new Square(
            tileSize * 43 / 48,
            tile.color.background,
            tile.foregroundSquare.x + tileSize * 5 / 48,
            tile.foregroundSquare.x + tileSize * 5 / 48
        );
    }
}

function updateTiles() {
    playingField.forEach(row => {
        row.forEach(tile => {
            setTileSize(tile);
        });
    });
}

function mockSpawnTile(player) {
    for (let y = player.y - 2; y <= player.y + 2; y++) {
        if (0 <= y && y < MAP_SIZE) {
            for (let x = player.x - 2; x <= player.x + 2; x++) {
                if (0 <= x && x < MAP_SIZE) {
                    playingField[y][x].occupier = player.id;
                    playingField[y][x].isSmall = false;
                    playingField[y][x].color = getPlayerColor(player);
                    updateTiles();
                }
            }
        }
    }
}

function drawTile(tile, x, y) {
    contextPlayingField.fillStyle = tile.backgroundSquare.color;
    contextPlayingField.fillRect(
        x + tile.backgroundSquare.x,
        y + tile.backgroundSquare.y,
        tile.backgroundSquare.size,
        tile.backgroundSquare.size
    );

    contextPlayingField.fillStyle = tile.foregroundSquare.color;
    contextPlayingField.fillRect(
        x + tile.foregroundSquare.x,
        y + tile.foregroundSquare.y,
        tile.foregroundSquare.size,
        tile.foregroundSquare.size
    );
}

function drawCircle(x, y, radius, color) {
    contextPlayingField.beginPath();
    contextPlayingField.arc(x, y, radius, 0, 2 * Math.PI);
    contextPlayingField.fillStyle = color;
    contextPlayingField.fill();
    contextPlayingField.closePath();
}

function drawHead(player) {
    // tile: 48, head: 60, circles: 58
    const HEAD_SIZE = tileSize * 60 / 48;
    const CIRCLE_RADIUS = (tileSize * 58 / 48) / 2;
    const OFFSET = tileSize * 2 / 48;

    const MIDDLE_X = (playingFieldWidth - tileSize) / 2;
    const MIDDLE_Y = (playingFieldHeight - tileSize) / 2;

    const TILE_X = MIDDLE_X + (player.x - players[myId].x) * tileSize;
    const TILE_Y = MIDDLE_Y + (player.y - players[myId].y) * tileSize;

    const HEAD_X = TILE_X + (tileSize - HEAD_SIZE) / 2;
    const HEAD_Y = TILE_Y + (tileSize - HEAD_SIZE) / 2;

    let color = getPlayerColor(player);

    drawCircle(HEAD_X + CIRCLE_RADIUS + OFFSET, HEAD_Y + CIRCLE_RADIUS + OFFSET, CIRCLE_RADIUS, color.background);
    drawCircle(HEAD_X + CIRCLE_RADIUS, HEAD_Y + CIRCLE_RADIUS, CIRCLE_RADIUS, color.foreground);
}

function drawTailPart(x, y, color, offset) {
    const MIDDLE_X = (playingFieldWidth - tileSize) / 2;
    const MIDDLE_Y = (playingFieldHeight - tileSize) / 2;

    const TILE_X = MIDDLE_X + (x - players[myId].x) * tileSize;
    const TILE_Y = MIDDLE_Y + (y - players[myId].y) * tileSize;

    //tile: 48, circle: 32, spacing: 20
    //let color = getPlayerColor(players[playingField[y][x].barrier]);

    drawCircle(
        TILE_X + tileSize * 20 / 48 + offset,
        TILE_Y + tileSize * 20 / 48 + offset,
        tileSize * 16 / 48,
        color
    );

    // square:
    const RECTANGLES = [
        new Rectangle(tileSize * 31 / 51, tileSize * 32 / 48, color, tileSize * 20 / 48 + offset, tileSize * 4 / 48 + offset),
        new Rectangle(tileSize * 32 / 48, tileSize * 31 / 51, color, tileSize * 4 / 48 + offset, tileSize * 20 / 48 + offset),
        new Rectangle(tileSize * 23 / 51, tileSize * 32 / 48, color, offset, tileSize * 4 / 48 + offset),
        new Rectangle(tileSize * 32 / 48, tileSize * 23 / 51, color, tileSize * 4 / 48 + offset, offset)
    ];

    //console.log(playingField[y][x].linked[0]);
    //console.log(playingField[y][x].linked[1]);

    if (playingField[y][x].linked[0] !== null) {
        contextPlayingField.fillStyle = color;

        contextPlayingField.fillRect(
            TILE_X + RECTANGLES[playingField[y][x].linked[0]].x,
            TILE_Y + RECTANGLES[playingField[y][x].linked[0]].y,
            RECTANGLES[playingField[y][x].linked[0]].width,
            RECTANGLES[playingField[y][x].linked[0]].height
        );
    }

    if (playingField[y][x].linked[1] !== null) {
        contextPlayingField.fillStyle = color;

        contextPlayingField.fillRect(
            TILE_X + RECTANGLES[playingField[y][x].linked[1]].x,
            TILE_Y + RECTANGLES[playingField[y][x].linked[1]].y,
            RECTANGLES[playingField[y][x].linked[1]].width,
            RECTANGLES[playingField[y][x].linked[1]].height
        );
    }

    if (playingField[y][x].linked[1] === null) {
        const PLAYER = players[playingField[y][x].barrier];

        if (!(PLAYER.movementX === 0 && PLAYER.movementY === 0)) {
            contextPlayingField.fillStyle = color;

            contextPlayingField.fillRect(
                TILE_X + RECTANGLES[directionCoorToInt(PLAYER.movementX, PLAYER.movementY)].x,
                TILE_Y + RECTANGLES[directionCoorToInt(PLAYER.movementX, PLAYER.movementY)].y,
                RECTANGLES[directionCoorToInt(PLAYER.movementX, PLAYER.movementY)].width,
                RECTANGLES[directionCoorToInt(PLAYER.movementX, PLAYER.movementY)].height
            );
        }
    }
}

function getPlayerColor(player) {
    return Object.values(COLOR.tile)[player.id % (Object.values(COLOR.tile).length - 1) + 1];
}

function drawPlayingField() {
    const HOR_PART = Math.round(HOR_VIEW_TILES / 2);

    const VER_VIEW_TILES = Math.round(playingFieldHeight / tileSize);
    const VER_PART = Math.round(VER_VIEW_TILES / 2);

    const LEFT_SPACING = (playingFieldWidth - tileSize) / 2;
    const UPPER_SPACING = (playingFieldHeight - tileSize) / 2;

    const LEFT_TILES_SIZE = HOR_PART * tileSize;
    const UPPER_TILES_SIZE = VER_PART * tileSize;

    const OFFSET_X = (LEFT_TILES_SIZE - LEFT_SPACING) + ((players[myId].x - Math.floor(players[myId].x)) * tileSize);
    const OFFSET_Y = (UPPER_TILES_SIZE - UPPER_SPACING) + ((players[myId].y - Math.floor(players[myId].y)) * tileSize);

    const MIN_Y = Math.floor(players[myId].y) - VER_PART;
    const MIN_X = Math.floor(players[myId].x) - HOR_PART;

    const MAX_Y = Math.round(players[myId].y) + VER_PART;
    const MAX_X = Math.round(players[myId].x) + HOR_PART;

    for (let y = MIN_Y; y <= MAX_Y; y++) {
        if (0 <= y && y < playingField.length) {
            for (let x = MIN_X; x <= MAX_X; x++) {
                //console.log(x + ", " + y);

                if (0 <= x && x < playingField[0].length) {
                    //console.log(x + ", " + y);
                    drawTile(playingField[y][x], (x - MIN_X) * tileSize - OFFSET_X, (y - MIN_Y) * tileSize - OFFSET_Y);
                }
            }
        }
    }
    //console.log("Offset: " + OFFSET_X);

}

function drawTail() {
    const HOR_PART = Math.round(HOR_VIEW_TILES / 2);

    const VER_VIEW_TILES = Math.round(playingFieldHeight / tileSize);
    const VER_PART = Math.round(VER_VIEW_TILES / 2);

    const MIN_Y = Math.floor(players[myId].y) - VER_PART;
    const MIN_X = Math.floor(players[myId].x) - HOR_PART;

    const MAX_Y = Math.round(players[myId].y) + VER_PART;
    const MAX_X = Math.round(players[myId].x) + HOR_PART;

    const FUNC = function (isForeground, offset) {
        for (let y = MIN_Y; y <= MAX_Y; y++) {
            if (0 <= y && y < playingField.length) {
                for (let x = MIN_X; x <= MAX_X; x++) {
                    if (0 <= x && x < playingField[0].length) {
                        if (playingField[y][x].barrier !== null) {
                            let color = getPlayerColor(players[playingField[y][x].barrier]);
                            if (isForeground) {
                                color = color.foreground;
                            } else {
                                color = color.background;
                            }
                            drawTailPart(x, y, color, offset);
                        }
                    }
                }
            }
        }
    };

    FUNC(false, tileSize * 4 / 48);
    FUNC(true, 0);
}

function frame(fps) {
    players.forEach(player => {
        if(!player.isDead) {
            player.x += player.movementX * 5 / fps;
            player.y += player.movementY * 5 / fps;

            barrierStuff(player);
        } else {
            animateDeath(player);
        }
    });

    //console.log("X: " + players[myId].x + ", Y: " + players[myId].y);

    drawEverythingOnPlayingField();
}

function animateDeath(player) {
    playingField.forEach(row => {
        row.forEach(tile => {
            if(tile.barrier === player.id) {
                tile.barrier = null;
            } else if(tile.occupier === player.id) {
                tile.occupier = null;
                tile.color = COLOR.tile.empty;
                tile.isSmall = true;
                setTileSize(tile);
            }
        });
    });
}

function barrierStuff(player) {
    if (round(player.x) % 1 === 0 && round(player.y) % 1 === 0) {
        const X = round(player.x); // - player.movementX);
        const Y = round(player.y);  //- player.movementY);

        //console.log("occ: X: " + X + ", Y: " + Y);

        if (0 <= X && X < MAP_SIZE && 0 <= Y && Y < MAP_SIZE) {
            if (playingField[Y][X].barrier === player.id && !(player.movementX === 0 && player.movementY === 0)) {
                // when player hits his own tail
                die(X, Y, player);
            } else if (playingField[Y][X].barrier !== null && playingField[Y][X].barrier !== player.id) {
                // when player hits someone else's tail
                playingField[Y][X].linked[1] = null;
                die(X, Y, players[playingField[Y][X].barrier]);
            }

            if ((playingField[Y][X].occupier !== player.id) && player.barrier.onOwnField) {
                // when you leave your field
                setPlayerBarrier(player, X, Y, true);
                onLeaveField(player, X, Y);

            } else if ((playingField[Y][X].occupier === player.id) && !player.barrier.onOwnField) {
                // when you enter your field
                setPlayerBarrier(player, X, Y, false);
                onEnterField(player);
            }

            if (playingField[Y][X].occupier !== player.id && !(0 === player.movementY && 0 === player.movementX)) {
                // when you are wandering over other fields and empty tiles
                onWander(player, X, Y);
            }
        } else {
            die(X, Y, player);
        }
    }
}

function onLeaveField(player, X, Y) {
    player.barrier.maxPoint.x = X;
    player.barrier.maxPoint.y = Y;
    player.barrier.minPoint.x = X;
    player.barrier.minPoint.y = Y;

}

function onEnterField(player) {
    //for test purposes
    //player.movementX = 0;
    //player.movementY = 0;

    completePath(player);
    setBarrierAsOccupied(player);
    let fieldFlood = copyAsNumArr(player);
    reverseFloodFill(player, 0, 0, fieldFlood);
    floodByBarrier(player, fieldFlood);

    let points = checkForOtherPlayers(player, fieldFlood);

    points.forEach(point => {
        reverseFloodFill(player, point.x, point.y, fieldFlood);
    });

    renewTiles(player, fieldFlood);
}

function onWander(player, X, Y) {
    playingField[Y][X].barrier = player.id;

    let y = player.movementY;
    let x = player.movementX;

    if (playingField[Y - y][X - x].occupier !== player.id) {
        playingField[Y - y][X - x].linked[1] = directionCoorToInt(x, y);
        y *= -1;
        x *= -1;
        playingField[Y][X].linked[0] = directionCoorToInt(x, y);
    }

    if (X < player.barrier.minPoint.x) {
        player.barrier.minPoint.x = X;
    }

    if (Y < player.barrier.minPoint.y) {
        player.barrier.minPoint.y = Y;
    }

    if (player.barrier.maxPoint.x < X) {
        player.barrier.maxPoint.x = X;
    }

    if (player.barrier.maxPoint.y < Y) {
        player.barrier.maxPoint.y = Y;
    }
}

function directionCoorToInt(x, y) {
    return (1 - x) * x * x + (2 - y) * y * y;
}

function die(X, Y, player) {
    player.isDead = true;

    console.log("Player n°" + player.id + " died!");

    let y = player.movementY;
    let x = player.movementX;

    if (playingField[Y - y][X - x].occupier !== player.id) {
        playingField[Y - y][X - x].linked[1] = directionCoorToInt(x, y);
    }

    player.movementX = 0;
    player.movementY = 0;
}

function completePath(player) {
    findBoundaries(
        player.barrier.beginPoint.x - player.barrier.beginDirection.x,
        player.barrier.beginPoint.y - player.barrier.beginDirection.y,
        player
    );
}

function findBoundaries(x, y, player) {
    if (0 <= x && 0 <= y) {
        if (playingField[y][x].occupier === player.id && !playingField[y][x].new) {
            playingField[y][x].new = true;

            if (x < player.barrier.minPoint.x) {
                player.barrier.minPoint.x = x;
            }

            if (y < player.barrier.minPoint.y) {
                player.barrier.minPoint.y = y;
            }

            if (player.barrier.maxPoint.x < x) {
                player.barrier.maxPoint.x = x;
            }

            if (player.barrier.maxPoint.y < y) {
                player.barrier.maxPoint.y = y;
            }

            findBoundaries(x, y - 1, player);
            findBoundaries(x, y + 1, player);
            findBoundaries(x - 1, y, player);
            findBoundaries(x + 1, y, player);
        }
    }
}

function copyAsNumArr(player) {
    let arr = new Array(0);

    const MAX_X = player.barrier.maxPoint.x - player.barrier.minPoint.x + 2;
    const MAX_Y = player.barrier.maxPoint.y - player.barrier.minPoint.y + 2;

    for (let y = 0; y <= MAX_Y; y++) {
        arr.push(new Array(0));

        for (let x = 0; x <= MAX_X; x++) {
            if((0 < x && 0 < y) && (x < MAX_X && y < MAX_Y)) {
                if(playingField[y-1 + player.barrier.minPoint.y][x-1 + player.barrier.minPoint.x].barrier === player.id) {
                    arr[y].push(2);
                } else if (playingField[y-1 + player.barrier.minPoint.y][x-1 + player.barrier.minPoint.x].occupier === player.id) {
                    arr[y].push(0);
                } else {
                    arr[y].push(1);
                }
            } else {
                arr[y].push(1);
            }
        }
    }

    return arr;
}

function setBarrierAsOccupied(player) {
    for (let y = player.barrier.minPoint.y; y <= player.barrier.maxPoint.y; y++) {
        for (let x = player.barrier.minPoint.x; x <= player.barrier.maxPoint.x; x++) {
            if (playingField[y][x].barrier === player.id) {
                playingField[y][x].occupier = player.id;
                playingField[y][x].color = getPlayerColor(player);
                playingField[y][x].isSmall = false;
                setTileSize(playingField[y][x]);
            }
        }
    }
}

function reverseFloodFill(player, X, Y, arr) {
    const FUNC = function (x, y, player) {
        //console.log("id: " + player.id);
        if (arr[y][x] === 1 || arr[y][x] === 4) {
            arr[y][x] = 3;

            if (0 < y)
                FUNC(x, y - 1, player);
            if (y < arr.length-1)
                FUNC(x, y + 1, player);
            if (0 < x)
                FUNC(x - 1, y, player);
            if (x < arr[0].length-1)
                FUNC(x + 1, y, player);
        }
    };

    FUNC(X, Y, player);
}

function floodByBarrier(player, arr) {
    const FUNC = function (x, y, player) {
        //console.log("id: " + player.id);
        if (arr[y][x] === 1 || arr[y][x] === 2) {
            arr[y][x] += 3;

            if (0 < y)
                FUNC(x, y - 1, player);
            if (y < arr.length-1)
                FUNC(x, y + 1, player);
            if (0 < x)
                FUNC(x - 1, y, player);
            if (x < arr[0].length-1)
                FUNC(x + 1, y, player);
        }
    };

    const X = player.barrier.beginPoint.x - player.barrier.minPoint.x + 1;
    const Y = player.barrier.beginPoint.y - player.barrier.minPoint.y + 1;
    FUNC(X, Y, player);
}

function checkForOtherPlayers(player, arr) {
    let points = [];

    for (let y = player.barrier.minPoint.y; y <= player.barrier.maxPoint.y; y++) {
        for (let x = player.barrier.minPoint.x; x <= player.barrier.maxPoint.x; x++) {
            const X = x - player.barrier.minPoint.x + 1;
            const Y = y - player.barrier.minPoint.y + 1;

            if (arr[Y][X] === 4) {
                players.forEach(p => {
                    if(p.x === x && p.y === y) {
                        points.push(new Point(X, Y));
                    }
                });
            }
        }
    }

    return points;
}

function renewTiles(player, arr) {
    for (let y = player.barrier.minPoint.y; y <= player.barrier.maxPoint.y; y++) {
        for (let x = player.barrier.minPoint.x; x <= player.barrier.maxPoint.x; x++) {
            const X = x - player.barrier.minPoint.x + 1;
            const Y = y - player.barrier.minPoint.y + 1;

            if (arr[Y][X] === 4 || arr[Y][X] === 5) {
                playingField[y][x].barrier = null;
                playingField[y][x].occupier = player.id;
                playingField[y][x].color = getPlayerColor(player);
                playingField[y][x].isSmall = false;
                setTileSize(playingField[y][x]);
            } else if(arr[Y][X] === 0) {
                playingField[y][x].new = false;
                playingField[y][x].linked = [null, null];
            }
        }
    }
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function showPath() {
    let s = "\n";

    for (let y = players[myId].barrier.minPoint.y; y <= players[myId].barrier.maxPoint.y; y++) {
        for (let x = players[myId].barrier.minPoint.x; x <= players[myId].barrier.maxPoint.x; x++) {
            if (playingField[y][x].occupier === null) {
                s += " ";
            } else {
                s += playingField[y][x].occupier;
            }
        }

        s += "\n";
    }

    return s;
}

function setPlayerBarrier(player, X, Y, begin) {
    if (begin) {
        player.barrier.onOwnField = false;
        player.barrier.beginPoint.x = X;
        player.barrier.beginPoint.y = Y;

        if (player.movementX === 0 && player.movementY === 0) {
            player.barrier.beginDirection.x = player.prevMovementX;
            player.barrier.beginDirection.y = player.prevMovementY;
        } else {
            player.barrier.beginDirection.x = player.movementX;
            player.barrier.beginDirection.y = player.movementY;
        }

    } else {
        player.barrier.onOwnField = true;
        player.barrier.endPoint.x = X;
        player.barrier.endPoint.y = Y;

        if (player.movementX === 0 && player.movementY === 0) {
            player.barrier.endDirection.x = player.prevMovementX;
            player.barrier.endDirection.y = player.prevMovementY;
        } else {
            player.barrier.endDirection.x = player.movementX;
            player.barrier.endDirection.y = player.movementY;
        }
    }
}

function round(num) {
    return Math.round(num * 100000) / 100000;
}

function onKeyDown(e) {
    let key = e.key;
    //console.log(key);

    let p = waitAndDoKeyDown(key);
}

async function waitAndDoKeyDown(key) {
    await resolveAfterFullCoordinates();

    try {
        keys[key]();
    } catch (e) {
        // nothing
    }
}

function resolveAfterFullCoordinates() {
    return new Promise(resolve => {
        const FUNC = resolve => {
            if (round(players[myId].x) % 1 === 0 && round(players[myId].y) % 1 === 0) {
                resolve(true);
            }
            setTimeout(() => {
                FUNC(resolve)
            }, 1);
        };

        FUNC(resolve);
    });
}

function goUp() {
    if ((paused && players[myId].prevMovementY <= 0) || (!paused && players[myId].movementY <= 0)) {
        players[myId].movementX = 0;
        players[myId].movementY = -1;

        paused = false;
    }
}

function goDown() {
    if ((paused && 0 <= players[myId].prevMovementY) || (!paused && 0 <= players[myId].movementY)) {
        players[myId].movementX = 0;
        players[myId].movementY = 1;

        paused = false;
    }
}

function goLeft() {
    if ((paused && players[myId].prevMovementX <= 0) || (!paused && players[myId].movementX <= 0)) {
        players[myId].movementX = -1;
        players[myId].movementY = 0;

        paused = false;
    }
}

function goRight() {
    if ((paused && 0 <= players[myId].prevMovementX) || (!paused && 0 <= players[myId].movementX)) {
        players[myId].movementX = 1;
        players[myId].movementY = 0;

        paused = false;
    }
}

function pause() {
    paused = !paused;

    if (paused) {
        players[myId].prevMovementX = players[myId].movementX;
        players[myId].prevMovementY = players[myId].movementY;

        players[myId].movementX = 0;
        players[myId].movementY = 0;
    } else {
        players[myId].movementX = players[myId].prevMovementX;
        players[myId].movementY = players[myId].prevMovementY;
    }
}
