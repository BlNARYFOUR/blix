"use strict";

document.addEventListener("DOMContentLoaded", init);

function init(e) {
    let buttons = document.querySelectorAll(".slideButton .button");

    for (let i=0; i<buttons.length; i++) {
        //console.log("INIT");
        buttons[i].addEventListener("click", toggleButton);
    }
}

function toggleButton(e) {
    //console.log("CLICKED");
    e.stopPropagation();
    e.target.classList.toggle("active");
}