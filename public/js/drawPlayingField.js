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

const FPS = 50;
// amount of tiles per second
let MOVEMENT_SPEED = 5;

const HOR_VIEW_TILES = 44;

let myId = 0;
let players = [];

let paused = false;


let playingField;

let canvasPlayingField;
let contextPlayingField;
let playingFieldHeight;
let playingFieldWidth;

let tileSize;

let frameInterval;
let mouseTimeout;

let isActiveGame = false;
let isAnimationDone = false;
let overlayPercent = 0;



function resolveAfterAnimation() {
    return new Promise(resolve => {
        const FUNC = resolve => {
            if (isAnimationDone) {
                resolve(true);
            }
            setTimeout(() => {
                FUNC(resolve)
            }, 1);
        };

        FUNC(resolve);
    });
}

function drawBegin(percent) {
    isAnimationDone = false;
    document.getElementById('overlay').classList.remove("hidden");

    let canvasOverlay = document.getElementById("overlay");
    let ctxOverlay = canvasOverlay.getContext("2d");
    let ph = document.documentElement.clientHeight * 3;
    let pw = document.documentElement.clientWidth * 3;
    canvasOverlay.height = ph;
    canvasOverlay.width = pw;

    overlayPercent = 0;

    function drawPane() {
        let w = pw;
        let h = (ph / 2) * (overlayPercent / 100);

        ctxOverlay.fillStyle = "#1C7EA9";

        ctxOverlay.fillRect(0, 0, w, h);
        ctxOverlay.fillRect(0, ph - h, w, h);

        overlayPercent += 7;

        if(overlayPercent < percent) {
            setTimeout(drawPane, 20);
        } else {
            h = (ph / 2) * (percent / 100);
            ctxOverlay.fillRect(0, 0, w, h);
            ctxOverlay.fillRect(0, ph - h, w, h);
            isAnimationDone = true;
        }
    }

    drawPane();
}

function drawEnd() {
    isAnimationDone = false;
    document.getElementById('overlay').classList.remove("hidden");

    let canvasOverlay = document.getElementById("overlay");
    let ctxOverlay = canvasOverlay.getContext("2d");
    let ph = document.documentElement.clientHeight * 3;
    let pw = document.documentElement.clientWidth * 3;
    canvasOverlay.height = ph;
    canvasOverlay.width = pw;

    overlayPercent = 100;

    function drawPane() {
        let w = pw;
        let h = (ph / 2) * (overlayPercent / 100);

        ctxOverlay.fillStyle = "#1C7EA9";

        ctxOverlay.clearRect(0,0, pw, ph);
        ctxOverlay.fillRect(0, 0, w, h);
        ctxOverlay.fillRect(0, ph - h, w, h);

        overlayPercent -= 7;

        if(0 < overlayPercent) {
            setTimeout(drawPane, 20);
        } else {
            h = (ph / 2) * (0 / 100);
            ctxOverlay.clearRect(0,0, pw, ph);
            ctxOverlay.fillRect(0, 0, w, h);
            ctxOverlay.fillRect(0, ph - h, w, h);
            isAnimationDone = true;
        }
    }

    drawPane();
}

function drawOverlayOnStartGame(percent) {
    isAnimationDone = false;
    document.querySelector('body').classList.add("activeGame");
    document.getElementById('overlay').classList.remove("hidden");
    resize();

    let canvasOverlay = document.getElementById("overlay");
    let ctxOverlay = canvasOverlay.getContext("2d");
    let ph = document.documentElement.clientHeight * 3;
    let pw = document.documentElement.clientWidth * 3;
    canvasOverlay.height = ph;
    canvasOverlay.width = pw;

    overlayPercent = 0;

    function drawPane() {
        let w = pw;
        let h = (ph / 2) * (overlayPercent / 100);

        ctxOverlay.fillStyle = "#1C7EA9";
        ctxOverlay.clearRect(0, 0, pw, ph);
        ctxOverlay.fillRect(0, h, w, ph / 2 - h);
        ctxOverlay.fillRect(0, ph / 2, w, ph / 2 - h);

        overlayPercent += 7;

        if(overlayPercent < percent) {
            setTimeout(drawPane, 20);
        } else {
            h = (ph / 2) * (percent / 100);
            ctxOverlay.clearRect(0, 0, pw, ph);
            ctxOverlay.fillRect(0, h, w, ph / 2 - h);
            ctxOverlay.fillRect(0, ph / 2, w, ph / 2 - h);
            isAnimationDone = true;
        }
    }

    drawPane();
}

function drawOverlayOnEndGameOverScreen() {
    isAnimationDone = false;
    document.querySelector('body').classList.add("activeGame");
    document.getElementById('overlay').classList.remove("hidden");
    resize();

    let canvasOverlay = document.getElementById("overlay");
    let ctxOverlay = canvasOverlay.getContext("2d");
    let ph = document.documentElement.clientHeight * 3;
    let pw = document.documentElement.clientWidth * 3;
    canvasOverlay.height = ph;
    canvasOverlay.width = pw;

    overlayPercent = 100;

    function drawPane() {
        let w = pw;
        let h = (ph / 2) * (overlayPercent / 100);

        ctxOverlay.fillStyle = "#1C7EA9";
        ctxOverlay.clearRect(0, 0, pw, ph);
        ctxOverlay.fillRect(0, h, w, ph / 2 - h);
        ctxOverlay.fillRect(0, ph / 2, w, ph / 2 - h);

        overlayPercent -= 7;

        if(0 < overlayPercent) {
            setTimeout(drawPane, 20);
        } else {
            h = (ph / 2) * (0 / 100);
            ctxOverlay.clearRect(0, 0, pw, ph);
            ctxOverlay.fillRect(0, h, w, ph / 2 - h);
            ctxOverlay.fillRect(0, ph / 2, w, ph / 2 - h);
            isAnimationDone = true;
        }
    }

    drawPane();
}

async function startGame() {
    await resolveAfterAnimation();

    document.querySelector('body').classList.add("background");
    // createPlayingField();
    resize();

    //players.forEach(player => mockSpawnTile(player));
    showMapStatsAndLeaderBoard();
    startAnimation();
    drawOverlayOnStartGame(100);

    playBackgroundMusic();

    await resolveAfterAnimation();

    document.getElementById('overlay').classList.add("hidden");

    isActiveGame = true;
    canMusicPlay = true;
    window.addEventListener("resize", resize);
    hideMouse();
}

function showMapStatsAndLeaderBoard() {
    document.getElementById('overlay').classList.add("hidden");

    if(document.getElementById('settingsPanel').classList.contains('sActive')) {
        document.getElementById('leaderboardPanel').classList.add("fade");
    } else {
        document.getElementById('leaderboardPanel').classList.remove("fade");
    }

    document.getElementById('leaderboardPanel').classList.add("sActive");
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
        frame()
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

function createPlayingField(mapSize) {
    playingField = new Array(0);

    for (let i = 0; i < mapSize; i++) {
        playingField.push(new Array(0));

        for (let j = 0; j < mapSize; j++) {
            playingField[i].push(new Tile(COLOR.tile.empty));
        }
    }
}

function getPlayerById(id) {
    let p = null;

    players.forEach((player) => {
        if(player.id === id) {
            p = player;
        }
    });

    return p;
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

function Tile(tileColor) {
    this.occupier = null;
    this.new = false;
    this.barrier = null;
    this.linked = [null, null]; //0: right, 1: down, 2: left, 3: up
    this.color = tileColor;

    setTileSize(this);
}

function setTileSize(tile) {
    if (tile.occupier === null || tile.occupier === undefined) {
        tile.foregroundSquare = new Square(
            tileSize * 36 / 48,
            COLOR.tile.empty.foreground,
            tileSize * 4 / 48,
            tileSize * 4 / 48
        );

        tile.backgroundSquare = new Square(
            tileSize * 36 / 48,
            COLOR.tile.empty.background,
            tile.foregroundSquare.x + tileSize * 5 / 48,
            tile.foregroundSquare.x + tileSize * 5 / 48
        );
    } else {
        // 48 TileWidth, 43 mainSquareWidth, pos: 0, 0
        tile.foregroundSquare = new Square(
            tileSize * 43 / 48,
            getColorById(tile.occupier).foreground,
            0,
            0
        );

        tile.backgroundSquare = new Square(
            tileSize * 43 / 48,
            getColorById(tile.occupier).background,
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
    let me = getPlayerById(myId);

    // tile: 48, head: 60, circles: 58
    const HEAD_SIZE = tileSize * 60 / 48;
    const CIRCLE_RADIUS = (tileSize * 58 / 48) / 2;
    const OFFSET = tileSize * 2 / 48;

    const MIDDLE_X = (playingFieldWidth - tileSize) / 2;
    const MIDDLE_Y = (playingFieldHeight - tileSize) / 2;

    const TILE_X = MIDDLE_X + (player.x - me.x) * tileSize;
    const TILE_Y = MIDDLE_Y + (player.y - me.y) * tileSize;

    const HEAD_X = TILE_X + (tileSize - HEAD_SIZE) / 2;
    const HEAD_Y = TILE_Y + (tileSize - HEAD_SIZE) / 2;

    let color = getPlayerColor(player);

    drawCircle(HEAD_X + CIRCLE_RADIUS + OFFSET, HEAD_Y + CIRCLE_RADIUS + OFFSET, CIRCLE_RADIUS, color.background);
    drawCircle(HEAD_X + CIRCLE_RADIUS, HEAD_Y + CIRCLE_RADIUS, CIRCLE_RADIUS, color.foreground);
}

function drawTailPart(x, y, color, offset) {
    let me = getPlayerById(myId);

    const MIDDLE_X = (playingFieldWidth - tileSize) / 2;
    const MIDDLE_Y = (playingFieldHeight - tileSize) / 2;

    const TILE_X = MIDDLE_X + (x - me.x) * tileSize;
    const TILE_Y = MIDDLE_Y + (y - me.y) * tileSize;

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
        const PLAYER = getPlayerById(playingField[y][x].barrier);

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

function getColorById(id) {
    return Object.values(COLOR.tile)[id % (Object.values(COLOR.tile).length - 1) + 1];
}

function drawPlayingField() {
    const ME = getPlayerById(myId);

    const HOR_PART = Math.round(HOR_VIEW_TILES / 2);

    const VER_VIEW_TILES = Math.round(playingFieldHeight / tileSize);
    const VER_PART = Math.round(VER_VIEW_TILES / 2);

    const LEFT_SPACING = (playingFieldWidth - tileSize) / 2;
    const UPPER_SPACING = (playingFieldHeight - tileSize) / 2;

    const LEFT_TILES_SIZE = HOR_PART * tileSize;
    const UPPER_TILES_SIZE = VER_PART * tileSize;

    const OFFSET_X = (LEFT_TILES_SIZE - LEFT_SPACING) + ((ME.x - Math.floor(ME.x)) * tileSize);
    const OFFSET_Y = (UPPER_TILES_SIZE - UPPER_SPACING) + ((ME.y - Math.floor(ME.y)) * tileSize);

    const MIN_Y = Math.floor(ME.y) - VER_PART;
    const MIN_X = Math.floor(ME.x) - HOR_PART;

    const MAX_Y = Math.round(ME.y) + VER_PART;
    const MAX_X = Math.round(ME.x) + HOR_PART;

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
    const ME = getPlayerById(myId);

    const HOR_PART = Math.round(HOR_VIEW_TILES / 2);

    const VER_VIEW_TILES = Math.round(playingFieldHeight / tileSize);
    const VER_PART = Math.round(VER_VIEW_TILES / 2);

    const MIN_Y = Math.floor(ME.y) - VER_PART;
    const MIN_X = Math.floor(ME.x) - HOR_PART;

    const MAX_Y = Math.round(ME.y) + VER_PART;
    const MAX_X = Math.round(ME.x) + HOR_PART;

    const FUNC = function (isForeground, offset) {
        for (let y = MIN_Y; y <= MAX_Y; y++) {
            if (0 <= y && y < playingField.length) {
                for (let x = MIN_X; x <= MAX_X; x++) {
                    if (0 <= x && x < playingField[0].length) {
                        if (playingField[y][x].barrier !== null) {
                            let color = getColorById(playingField[y][x].barrier);
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

function doPlayersLerp() {
    players.forEach((player) => {
        player.x += (player.nextX - player.prevX) * MOVEMENT_SPEED / FPS;
        player.y += (player.nextY - player.prevY) * MOVEMENT_SPEED / FPS;
    });
}

function frame() {
    //console.log("FRAME");
    //console.log("X: " + players[myId].x + ", Y: " + players[myId].y);

    doPlayersLerp();
    drawEverythingOnPlayingField();
}

function doDeathAnimation(player) {
    function animate() {
        let done = true;

        playingField.forEach(row => {
            row.forEach(tile => {
                if(tile.barrier === player.id) {
                    tile.barrier = null;
                } else if(tile.occupier === player.id) {
                    done = false;
                    if(Math.random() < 0.2) {
                        tile.occupier = null;
                        tile.color = COLOR.tile.empty;
                        setTileSize(tile);
                    }
                }
            });
        });

        if(!done) {
            setTimeout(animate, 20);
        } else {
            setTimeout(function () {
                player.deathAnimationDone = true;
            }, 1500);
        }
    }

    animate();
}

function resolveAfterDeathAnimationDone(player) {
    return new Promise(resolve => {
        const FUNC = resolve => {
            if (player.deathAnimationDone) {
                resolve(true);
            }
            setTimeout(() => {
                FUNC(resolve)
            }, 1);
        };

        FUNC(resolve);
    });
}

function doUpdateAnimation() {
    function animation() {
        let done = true;

        playingField.forEach(row => {
            row.forEach(tile => {
                if(tile.updated) {
                    done = false;
                    if(Math.random() < 0.2) {
                        //console.log("ANIMATE");
                        tile.occupier = tile.nextOccupier;
                        tile.updated = false;
                        setTileSize(tile);
                    }
                }
            });
        });

        if(!done) {
            setTimeout(animation, 20);
        }
    }

    animation();
}

async function animateUpdate() {
    doUpdateAnimation();
}

async function animateDeath(player) {
    player.deathAnimationBusy = true;
    doDeathAnimation(player);

    await resolveAfterDeathAnimationDone(player);

    if(player.id === myId) {
        let p = showGameOverScreen();
    }
}

async function showGameOverScreen() {
    console.log("GAME OVER");
    resize();

    drawBegin(100);

    await resolveAfterAnimation();

    document.getElementById("gameOverOverlay").classList.add("active");

    drawOverlayOnStartGame(100);

    await resolveAfterAnimation();

    isActiveGame = false;
    canMusicPlay = false;

    let pr = stopBackgroundMusic(5000);

    setTimeout(showMainMenu, 5000);
}

async function showMainMenu() {
    drawOverlayOnEndGameOverScreen();

    await resolveAfterAnimation();

    document.getElementById("gameOverOverlay").classList.remove("active");
    clearInterval(frameInterval);
    document.getElementById('leaderboardPanel').classList.remove("sActive");
    document.querySelector('body').classList.remove("activeGame");

    drawEnd();

    await resolveAfterAnimation();

    document.getElementById('overlay').classList.add("hidden");
}

function directionCoorToInt(x, y) {
    return (1 - x) * x * x + (2 - y) * y * y;
}

function getPlayersAlive() {
    return players.filter(function (player) {
        return !player.isDead;
    });
}

function getAlivePlayersRanked() {
    let p = players.slice();

    let filtered = getPlayersAlive();

    filtered.sort(function (p1, p2) {
        return p2.score - p1.score;
    });

    return filtered;
}

function getAllPlayersRanked(p) {
    p.sort(function (p1, p2) {
        return p2.score - p1.score;
    });

    return p;
}
