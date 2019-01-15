"use strict";

function drawMap(canvasId, playingField) {
    let canvas = document.getElementById(canvasId);
    let ctx = canvas.getContext("2d");
    const DRAW_SIZE = playingField.length*2;
    const TILE_SIZE = DRAW_SIZE / playingField.length;
    canvas.width = DRAW_SIZE;
    canvas.height = DRAW_SIZE;

    ctx.clearRect(0, 0, playingField.length-1, playingField.length-1);
    ctx.fillStyle = "#004461";

    for(let y=0; y<playingField.length; y++) {
        for(let x=0; x<playingField.length; x++) {
            if(playingField[y][x].occupier !== null || playingField[y][x].nextOccupier !== null) {
                ctx.fillRect(x*TILE_SIZE, y*TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}