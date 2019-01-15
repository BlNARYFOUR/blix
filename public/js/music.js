"use strict";

let fadeDone = false;
let bgMusicOff = false;
let canMusicPlay = false;

const sounds = {
    backgroundMusic: createAudioObj("snakesRevenge.mp3")
};

document.addEventListener("DOMContentLoaded", init);

function init(e) {
    sounds.backgroundMusic.loop = true;
    sounds.backgroundMusic.volume = 0.0;

    document.querySelector('#musicState .button').addEventListener('click', adjustMusicState);
}

function adjustMusicState(e) {
    if(!e.target.classList.contains("active")) {
        bgMusicOff = false;

        if(canMusicPlay) {
            playBackgroundMusic();
        }
    } else {
        bgMusicOff = true;
        let pr = stopBackgroundMusic(500);
    }
}

function playBackgroundMusic() {
    if(!bgMusicOff) {
        sounds.backgroundMusic.currentTime = 0;
        sounds.backgroundMusic.play();
        fade(sounds.backgroundMusic, 0.3, 500);
    }
}

function resolveFade() {
    return new Promise(resolve => {
        const FUNC = resolve => {
            if (fadeDone) {
                resolve(true);
            }
            setTimeout(() => {
                FUNC(resolve)
            }, 1);
        };

        FUNC(resolve);
    });
}

async function stopBackgroundMusic(time) {
    fade(sounds.backgroundMusic, 0, time);

    await resolveFade();

    sounds.backgroundMusic.pause();
    sounds.backgroundMusic.currentTime = 0;
}

function fade(sound, volumeTo, timeInMs) {
    fadeDone = false;
    let volume = sound.volume;
    let diff = (volumeTo - sound.volume) * 10 / timeInMs;

    const FUNC = function () {
        sound.volume = volume;

        volume += diff;

        if((diff < 0 && volumeTo < volume) || (0 < diff && volume < volumeTo)) {
            setTimeout(FUNC, 10);
        } else {
            fadeDone = true;
        }
    };

    FUNC();
}

function createAudioObj(fileName) {
    let audio = document.createElement("audio");
    audio.src = "media/" + fileName;
    return audio;
}