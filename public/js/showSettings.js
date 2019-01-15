"use strict";

document.addEventListener("DOMContentLoaded", init);

function init(e) {
    document.querySelector("#settingsPanel #sHeader #settingsIcon").addEventListener("click", onClick);
}

function onClick(e) {
    e.preventDefault();

    document.getElementById("settingsPanel").classList.toggle("sActive");

    if(isActiveGame) {
        document.getElementById('leaderboardPanel').classList.toggle("fade");
    }
}