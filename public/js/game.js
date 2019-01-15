"use strict";

//import * as Map from './drawMap.js';

const MAX_PLAYERS = 60;
let ws;
let data;
// let currentTime;
// let timeDiff;

//0: right, 1: down, 2: left, 3: up
let keys = {
    d: goRight,
    s: goDown,
    q: goLeft,
    z: goUp,
    ArrowUp: goUp,
    ArrowDown: goDown,
    ArrowLeft: goLeft,
    ArrowRight: goRight,
    p: pause
};

document.addEventListener("DOMContentLoaded", init);

function wsOnOpen(e) {
    console.log("Connection opened!");
}

function wsOnClose(e) {
    console.log("Connection closed!");
}

function wsOnError(e) {
    console.log("Error occurred!");
}

function wsOnMessage(e) {
    //console.log("Message received: " + e.data);
    data = JSON.parse(e.data);

    // TODO remove lag by using timestamp :)
    // let timestamp = data.timestamp;
    // currentTime = new Date().getTime();
    //
    // timeDiff = (currentTime - Math.round(timestamp*1000))/1000;
    // console.log(timeDiff);

    let address = data.address;

    switch (address) {
        case "blix.actions.start":
            myId = data.id;
            createPlayingField(data.playingField.length);
            copyPlayingField(data.playingField);
            players = data.players;
            updatePlayersMovement(data.players);
            updateMap();
            startGame();
            document.addEventListener('keydown', onKeyDown);
            document.addEventListener("mousemove", hideMouse);
            //console.log("start");
            break;
        case "blix.actions.update":
            //console.log(data.updatedTiles);
            updatePlayingField(data.updatedTiles);
            updatePlayersMovement(data.players);
            updateMap();
            break;
        // case "blix.actions.update.players":
        //     updatePlayersMovement();
        //     break;
    }
}

function updatePlayersMovement(dataPlayers) {
    //console.log(dataPlayers);

    if(dataPlayers instanceof Array) {
        dataPlayers.forEach((player) => {
            doPlayerStuff(player);
        });
    } else {
        //console.log(dataPlayers);
        doPlayerStuff(dataPlayers);
    }
}

function updateMap() {
    drawMap("map", playingField);
}

function doPlayerStuff(player) {
    //let p = waitAndUpdatePlayerMovement(player);

    //console.log(getPlayerById(player.id).x);
    //console.log("update");

    if (getPlayerById(player.id) === null) {
        players.push(player);
    }

    getPlayerById(player.id).prevX = getPlayerById(player.id).x;
    getPlayerById(player.id).prevY = getPlayerById(player.id).y;
    getPlayerById(player.id).nextX = player.x;
    getPlayerById(player.id).nextY = player.y;
    getPlayerById(player.id).isDead = player.isDead;
    getPlayerById(player.id).score = player.score;
    getPlayerById(player.id).kills = player.kills;

    app.ranking = getAlivePlayersRanked().slice(0, 10);

    if(player.id === myId) {
        app.score = player.score;
        app.kills = player.kills;

    }

    if(player.id === myId && !player.isDead) {
        app.rank = getAlivePlayersRanked().indexOf(getPlayerById(player.id)) + 1;
        app.amountOfPlayers = getPlayersAlive().length;
    }

    if(player.id === myId && player.isDead) {
        let p = getPlayersAlive();
        p.push(getPlayerById(player.id));

        app.rank = getAllPlayersRanked(p).indexOf(getPlayerById(player.id)) + 1;
        app.amountOfPlayers = p.length;
    }

    if(player.x < playingField.length && player.y < playingField.length && 0 <= player.x && 0 <= player.y) {
        if (playingField[player.y][player.x].barrier === player.id) {
            playingField[player.y][player.x].barrier = null;
        }
    }

    // player.x += player.movementX * 5 / FPS;
    // player.y += player.movementY * 5 / FPS;

    if (player.isDead) {
        getPlayerById(player.id).nextX = getPlayerById(player.id).prevX;
        getPlayerById(player.id).nextY = getPlayerById(player.id).prevY;

        if(!getPlayerById(player.id).deathAnimationBusy) {
            animateDeath(getPlayerById(player.id));
        }
    } else {
        getPlayerById(player.id).deathAnimationDone = false;
        getPlayerById(player.id).deathAnimationBusy = false;
    }
}

// async function waitAndUpdatePlayerMovement(player) {
//     await resolveAfterFullCoordinates(player.id);
//
//     try {
//         getPlayerById(player.id).movementX = player.movementX;
//         getPlayerById(player.id).movementY = player.movementY;
//     } catch (e) {
//         // nothing
//     }
// }

function copyPlayingField(dataPl) {
    for(let y=0; y<dataPl.length; y++) {
        for(let x=0; x<dataPl[y].length; x++) {
            let oo = Math.floor(dataPl[y][x] / (6*6*(MAX_PLAYERS+2)));
            let bb = Math.floor((dataPl[y][x] % (6*6*(MAX_PLAYERS+2)*oo)) / (6*6));
            let l0 = Math.floor(((dataPl[y][x] % (6*6*(MAX_PLAYERS+2)*oo)) % (6*6*bb)) / 6);
            let l1 = ((dataPl[y][x] % (6*6*(MAX_PLAYERS+2)*oo)) % (6*6*bb)) % (6*l0);

            playingField[y][x].nextOccupier = null;
            playingField[y][x].occupier = oo === 1 ? null : oo - 2;
            playingField[y][x].barrier = bb === 1 ? null : bb - 2;
            playingField[y][x].linked = [l0 === 1 ? null : l0 - 2, l1 === 1 ? null : l1 - 2];
            playingField[y][x].updated = false;
        }
    }
}

async function updatePlayingField(dataPl) {
    let doAnimation = false;

    for(let i=0; i<dataPl.length; i++) {
        let key = JSON.parse(Object.keys(dataPl[i])[0]);
        let x = key.x;
        let y = key.y;

        let value = Object.values(dataPl[i])[0][0];

        let oo = Math.floor(value / (6*6*(MAX_PLAYERS+2)));
        let bb = Math.floor((value % (6*6*(MAX_PLAYERS+2)*oo)) / (6*6));
        let l0 = Math.floor(((value % (6*6*(MAX_PLAYERS+2)*oo)) % (6*6*bb)) / 6);
        let l1 = ((value % (6*6*(MAX_PLAYERS+2)*oo)) % (6*6*bb)) % (6*l0);

        playingField[y][x].nextOccupier = oo === 1 ? null : oo - 2;
        playingField[y][x].barrier = bb === 1 ? null : bb - 2;
        playingField[y][x].linked = [l0 === 1 ? null : l0 - 2, l1 === 1 ? null : l1 - 2];

        if(playingField[y][x].occupier !== playingField[y][x].nextOccupier) {
            playingField[y][x].updated = true;
            doAnimation = true;
        }
    }

    if(doAnimation) {
        let pr = animateUpdate();
    }
}

function init(e) {
    openSocket();

    document.querySelector("form").addEventListener("submit", onPlayRequest);
}

function resolveAfterOpenWebSocket(websocket) {
    return new Promise(resolve => {
        const FUNC = resolve => {
            if (websocket.readyState === websocket.OPEN) {
                resolve(true);
            }
            setTimeout(() => {
                FUNC(resolve)
            }, 1);
        };

        FUNC(resolve);
    });
}

function openSocket() {
    if(window.location.protocol === "https:") {
        ws = new WebSocket("wss://" + window.location.host + "/wss");
    } else {
        ws = new WebSocket("ws://" + window.location.host + ":4321");
    }

    ws.addEventListener("open", (e) => wsOnOpen(e));
    ws.addEventListener("close", (e) => wsOnClose(e));
    ws.addEventListener("error", (e) => wsOnError(e));
    ws.addEventListener("message", (e) => wsOnMessage(e));
}

async function onPlayRequest(e) {
    e.preventDefault();

    if(!isMobile()) {
        if(ws.readyState === ws.CLOSED) {
            openSocket();
        }

        let username = document.getElementById("name").value;
        let data = {
            address: "blix.actions.start",
            data: {
                name: username
            }
        };

        console.log(ws.readyState);

        drawBegin(100);

        await resolveAfterOpenWebSocket(ws);

        // noinspection JSUnresolvedVariable
        if(ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify(data));
        } else {
            console.log("Not opened? :/");
        }
    } else {
        console.log("Nah, not opening a Websocket ¯\\_(ツ)_/¯");
    }
}

function onKeyDown(e) {
    let key = e.key;
    //console.log(key);

    if(ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
            address: "blix.actions.control",
            data: {
                key: key
            }
        }));
    }
    // else {
    //     console.log("Not opened? :/");
    // }
    //
    // let p = waitAndDoKeyDown(key);
}

// function resolveAfterFullCoordinates(id) {
//     return new Promise(resolve => {
//         const FUNC = resolve => {
//             let player = getPlayerById(id);
//
//             if (round(player.x) % 1 === 0 && round(player.y) % 1 === 0) {
//                 resolve(true);
//             }
//             setTimeout(() => {
//                 FUNC(resolve)
//             }, 1);
//         };
//
//         FUNC(resolve);
//     });
// }

// async function waitAndDoKeyDown(key) {
//     await resolveAfterFullCoordinates(myId);
//
//     try {
//         keys[key]();
//     } catch (e) {
//         // nothing
//     }
// }

function goUp() {
    let player = getPlayerById(myId);

    // if ((paused && player.prevMovementY <= 0) || (!paused && player.movementY <= 0)) {
    //     player.movementX = 0;
    //     player.movementY = -1;
    //
    //     paused = false;
    // }
}

function goDown() {
    let player = getPlayerById(myId);

    // if ((paused && 0 <= player.prevMovementY) || (!paused && 0 <= player.movementY)) {
    //     player.movementX = 0;
    //     player.movementY = 1;
    //
    //     paused = false;
    // }
}

function goLeft() {
    let player = getPlayerById(myId);

    // if ((paused && player.prevMovementX <= 0) || (!paused && player.movementX <= 0)) {
    //     player.movementX = -1;
    //     player.movementY = 0;
    //
    //     paused = false;
    // }
}

function goRight() {
    let player = getPlayerById(myId);

    // if ((paused && 0 <= player.prevMovementX) || (!paused && 0 <= player.movementX)) {
    //     player.movementX = 1;
    //     player.movementY = 0;
    //
    //     paused = false;
    // }
}

function pause() {
    let player = getPlayerById(myId);

    paused = !paused;

    // if (paused) {
    //     player.prevMovementX = player.movementX;
    //     player.prevMovementY = player.movementY;
    //
    //     player.movementX = 0;
    //     player.movementY = 0;
    // } else {
    //     player.movementX = player.prevMovementX;
    //     player.movementY = player.prevMovementY;
    // }
}
