<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Blix.io</title>

    <link rel="stylesheet" type="text/css" href="{{asset('css/reset.css')}}" />
    <link rel="stylesheet" type="text/css" href="{{asset('css/screen.css')}}" />
</head>
<body>
    <header>
        <h1>Blix.io</h1>
    </header>

    <main id="app">
        <div id="preGameContainer">
            <form>
                <input type="text" id="name" name="name" placeholder="Username" autocomplete="off" />
                <input type="submit" id="submit" name="submit" value="Play" />
            </form>

            <span id="mobileWarning">
                This game cannot be
                <br />
                played on a phone.
                <br />
                <br />
                Open it on your computer instead.
            </span>
        </div>

        <div id="gameContainer">
            <section id="playingFieldContainer">
                <canvas id="playingField"></canvas>
            </section>
            <section id="statsContainer">
                <ul>
                    <li><span>Kills:</span><span v-html="kills" class="bold"></span></li>
                    <li><span>Score:</span><span v-html="score" class="bold"></span></li>
                    <li><span>Rank:</span><span v-html="rank" class="bold"></span><span>of</span><span v-html="amountOfPlayers" class="bold"></span></li>
                </ul>
            </section>
            <section id="mapContainer">
                <canvas id="map"></canvas>
            </section>
            <section id="leaderboardPanel" class="panel">
                <div id="sHeader" class="pHeader">
                    <h2 id="leaderboard" class="sPadding">Leaderboard</h2>
                </div>
                <leaderboard class="sPadding pContent"></leaderboard>
            </section>
        </div>

        <section id="settingsPanel" class="panel pTransition">
            <div id="sHeader" class="pHeader">
                <h2 id="Settings" class="sPadding pTransition">Settings</h2>
                <span id="settingsIcon" class="settingsIcon pTransition"></span>
            </div>
            <div id="sContent" class="sPadding pContent pTransition">
                <h3>Controls</h3>
                <ul>
                    <li><span>Move up:</span><span id="controlUp">ArrowUp</span></li>
                    <li><span>Move down:</span><span id="controlDown">ArrowDown</span></li>
                    <li><span>Move left:</span><span id="controlLeft">ArrowLeft</span></li>
                    <li><span>Move right:</span><span id="controlRight">ArrowRight</span></li>
                    <li><span>Pause:</span><span id="controlPause">P</span></li>
                </ul>

                <h3>Sound</h3>
                <ul>
                    <li>
                        <span>Music:</span>
                        <span id="musicState" class="slideButton">
                            <span class="slide">
                                <span class="check"><span></span><span></span></span>
                                <span class="cross"><span></span><span></span></span>
                            </span>
                            <span class="button active"></span>
                        </span>
                    </li>
                    <li>
                        <span>Sound effects:</span>
                        <span id="soundEffectsState" class="slideButton disabled">
                            <span class="slide">
                                <span class="check"><span></span><span></span></span>
                                <span class="cross"><span></span><span></span></span>
                            </span>
                            <span class="button active"></span>
                        </span>
                    </li>
                </ul>
            </div>
        </section>

        <div id="gameOverOverlay" class="shadowContainer">
            <div id="gameOverInner">
                <h2>GAME OVER</h2>
                <ul>
                    <li><span>Kills:</span><span v-html="kills" class="bold"></span></li>
                    <li><span>Score:</span><span v-html="score" class="bold"></span></li>
                    <li><span>Rank:</span><span v-html="rank" class="bold"></span><span>of</span><span v-html="amountOfPlayers" class="bold"></span></li>
                </ul>
            </div>
        </div>

        <canvas id="overlay" class="hidden"></canvas>
    </main>

    <script type="text/javascript" src="{{asset('js/vue.min.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/vueApp.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/mobileRegex.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/mobileCheck.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/music.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/drawPlayingField.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/drawMap.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/game.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/showSettings.js')}}"></script>
    <script type="text/javascript" src="{{asset('js/slideButton.js')}}"></script>
</body>
</html>