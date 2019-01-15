"use strict";

function isMobile () {
    let check = false;

    // noinspection JSUnresolvedVariable
    (
        function(e) {
            if(mobileRegex.getRegex(e)) {
                check = true;
            }
        }
    )
    (navigator.userAgent||navigator.vendor||window.opera);
    return check;
}

function init (e) {
    e.preventDefault();

    if(isMobile()) {
        document.querySelector("main").classList.add("mobile");
    }
}

document.addEventListener("DOMContentLoaded", init);
