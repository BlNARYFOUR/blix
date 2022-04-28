<?php
/**
 * Created by PhpStorm.
 * User: brend
 * Date: 4/12/2018
 * Time: 14:40
 */

namespace App;


use Exception;
use Illuminate\Support\Facades\Storage;
use PhpParser\Node\Expr\Cast\Object_;

class Game
{
    const MAP_SIZE = 200;
    const MAX_PLAYERS = 60;

    // MUST BE UNEVEN
    const SPAWN_SIZE = 5;
    const KILL_SCORE = 500;

    private $players = [];
    private $prevPlayingField;
    private $playingField;
    private $updatedTiles = [];
    private $frameCount = 0;

    public function __construct()
    {
        $this->createPlayingField();
        $this->initConsumers();
    }

    private function createPlayingField() {
        $this->playingField = array();
        $this->prevPlayingField = array();

        for ($i = 0; $i < static::MAP_SIZE; $i++) {
            array_push($this->playingField, array());
            array_push($this->prevPlayingField, array());

            for ($j = 0; $j < static::MAP_SIZE; $j++) {
                array_push($this->playingField[$i], new Tile());
                array_push($this->prevPlayingField[$i], new Tile());
            }
        }
    }

    private function initConsumers() {
        MessageHandler::addConsumer("blix.actions.start", $this, "startRequestHandler");
        MessageHandler::addConsumer("blix.actions.control", $this, "controlHandler");
    }

    function isAlreadyUsed($connection) {
        $arr = array_filter($this->players, array(new ConnectionFilter($connection), "equals"));
        $arr = array_filter($arr, function (Player $player) {
            return !$player->isDead();
        });

        return count($arr) != 0;
    }

    function startRequestHandler($connection, $data) {
        echo "Start Request Handler: Data: " . json_encode($data);

        $name = array_get($data, "name", -1);
        var_dump($name);

        if(count($this->players) < static::MAX_PLAYERS) {
            if ($name != -1 && !$this->isAlreadyUsed($connection)) {
                $player = $this->addPlayer($name, $connection);
                $this->spawnPlayer($player);
                $player->getConnection()->send(json_encode([
                    "address" => "blix.actions.start",
                    "id" => $player->getId(),
                    "playingField" => $this->playingField,
                    "players" => $this->players //,
                    //"timestamp" => microtime(true)
                ]));

                //$this->sendUpdate();
            }
            $this->logPlayers();
        } else {
            echo "Lobby is full!\n";
        }
    }

    function controlHandler($connection, $data) {
        $keys = [
            "z" => "goUp",
            "s" => "goDown",
            "q" => "goLeft",
            "d" => "goRight",
            "ArrowUp" => "goUp",
            "ArrowDown" => "goDown",
            "ArrowLeft" => "goLeft",
            "ArrowRight" => "goRight",
            "p" => "pause"
        ];

        $key = array_get($data, "key", -1);

        try {
            $players = array_filter($this->players, array(new ConnectionFilter($connection), 'equals'));

            foreach ($players as $player) {
                call_user_func_array([$player, array_get($keys, $key)], []);
            }

            //$this->sendPlayerUpdate();
        } catch (Exception $e) {
            echo "No valid key!\n";
        }
    }

    function logPlayers() {
        $string = "";
        foreach ($this->players as $player) {
            $string .= "\t" . $player . "\n";
        }
        echo $string;
    }

    function directionCoorToInt($x, $y) {
        return (1 - $x) * $x * $x + (2 - $y) * $y * $y;
    }

     function diePlayer($X, $Y, Player $player) {
        echo "Player died";
         $player->setDead(true);

//         $y = $player->getMovementY();
//         $x = $player->getMovementX();
//
//         $tile = $this->playingField[$Y - $y][$X - $x];
//         if($tile instanceof Tile) {
//             if ($tile->getOccupier() !== $player->getId()) {
//                 $tile->setSecondLinked($this->directionCoorToInt($x, $y));
//             }
//         }
//
//         $player->stopMoving();
     }

    function getPlayerById($id) {
        $p = null;

        foreach ($this->players as $player) {
            if($player instanceof Player) {
                if ($player->getId() === $id) {
                    $p = $player;
                }
            }
        }

        return $p;
    }

    function setPlayerBarrier(Player $player, $X, $Y, $begin) {
        if ($begin) {
            $player->getBarrier()->setOnOwnField(false);
            $player->getBarrier()->getBeginPoint()->x = $X;
            $player->getBarrier()->getBeginPoint()->y = $Y;

            if ($player->getMovementX() == 0 && $player->getMovementY() == 0) {
                $player->getBarrier()->getBeginDirection()->x = $player->getPrevMovementX();
                $player->getBarrier()->getBeginDirection()->y = $player->getPrevMovementY();
            } else {
                $player->getBarrier()->getBeginDirection()->x = $player->getMovementX();
                $player->getBarrier()->getBeginDirection()->y = $player->getMovementY();
            }
        } else {
            $player->getBarrier()->setOnOwnField(true);
            $player->getBarrier()->getEndPoint()->x = $X;
            $player->getBarrier()->getEndPoint()->y = $Y;

            if ($player->getMovementX() == 0 && $player->getMovementY() == 0) {
                $player->getBarrier()->getEndDirection()->x = $player->getPrevMovementX();
                $player->getBarrier()->getEndDirection()->y = $player->getPrevMovementY();
            } else {
                $player->getBarrier()->getEndDirection()->x = $player->getMovementX();
                $player->getBarrier()->getEndDirection()->y = $player->getMovementY();
            }
        }
    }

    function onLeaveField(Player $player, $X, $Y) {
        $player->getBarrier()->getMaxPoint()->x = $X;
        $player->getBarrier()->getMaxPoint()->y = $Y;
        $player->getBarrier()->getMinPoint()->x = $X;
        $player->getBarrier()->getMinPoint()->y = $Y;
    }

    function findBoundaries($x, $y, Player $player) {
        if (0 <= $x && 0 <= $y && $x < static::MAP_SIZE && $y < static::MAP_SIZE) {
            $tile = $this->playingField[$y][$x];

            if($tile instanceof Tile) {
                if ($tile->getOccupier() === $player->getId() && !$tile->isNew()) {
                    $tile->setNew(true);

                    if ($x < $player->getBarrier()->getMinPoint()->x) {
                        $player->getBarrier()->getMinPoint()->x = $x;
                    }

                    if ($y < $player->getBarrier()->getMinPoint()->y) {
                        $player->getBarrier()->getMinPoint()->y = $y;
                    }

                    if ($player->getBarrier()->getMaxPoint()->x < $x) {
                        $player->getBarrier()->getMaxPoint()->x = $x;
                    }

                    if ($player->getBarrier()->getMaxPoint()->y < $y) {
                        $player->getBarrier()->getMaxPoint()->y = $y;
                    }

                    $this->findBoundaries($x, $y - 1, $player);
                    $this->findBoundaries($x, $y + 1, $player);
                    $this->findBoundaries($x - 1, $y, $player);
                    $this->findBoundaries($x + 1, $y, $player);
                }
            }
        }
    }

    function completePath(Player $player) {
        $this->findBoundaries(
            $player->getBarrier()->getBeginPoint()->x - $player->getBarrier()->getBeginDirection()->x,
            $player->getBarrier()->getBeginPoint()->y - $player->getBarrier()->getBeginDirection()->y,
            $player
        );

        //echo json_encode($player->getBarrier());
    }

    function setBarrierAsOccupied(Player $player) {
        for ($y = $player->getBarrier()->getMinPoint()->y; $y <= $player->getBarrier()->getMaxPoint()->y; $y++) {
            for ($x = $player->getBarrier()->getMinPoint()->x; $x <= $player->getBarrier()->getMaxPoint()->x; $x++) {
                $tile = $this->playingField[$y][$x];

                if($tile instanceof Tile) {
                    if ($tile->getBarrier() === $player->getId()) {
                        $tile->setOccupier($player->getId());
                    }
                }
            }
        }
    }

    function copyAsNumArr(Player $player) {
        $arr = [];

        $MAX_X = $player->getBarrier()->getMaxPoint()->x - $player->getBarrier()->getMinPoint()->x + 2;
        $MAX_Y = $player->getBarrier()->getMaxPoint()->y - $player->getBarrier()->getMinPoint()->y + 2;

        for ($y = 0; $y <= $MAX_Y; $y++) {
            array_push($arr, []);

            for ($x = 0; $x <= $MAX_X; $x++) {
                    if((0 < $x && 0 < $y) && ($x < $MAX_X && $y < $MAX_Y)) {
                        $tile = $this->playingField[$y-1 + $player->getBarrier()->getMinPoint()->y][$x-1 + $player->getBarrier()->getMinPoint()->x];

                        if($tile instanceof Tile) {
                            if ($tile->getBarrier() === $player->getId()) {
                                array_push($arr[$y], 2);
                            } else if ($tile->getOccupier() === $player->getId()) {
                                array_push($arr[$y], 0);
                            } else {
                                array_push($arr[$y], 1);
                            }
                        }
                    } else {
                        array_push($arr[$y], 1);
                    }
                }
        }

        return $arr;
    }

    function rfFUNC ($x, $y, Player $player, &$arr) {
        //console.log("id: " + player.id);
        if ($arr[$y][$x] == 1 || $arr[$y][$x] == 4) {
            $arr[$y][$x] = 3;

            if (0 < $y)
                $this->rfFUNC($x, $y - 1, $player, $arr);
            if ($y < count($arr)-1)
                $this->rfFUNC($x, $y + 1, $player, $arr);
            if (0 < $x)
                $this->rfFUNC($x - 1, $y, $player, $arr);
            if ($x < count($arr[0])-1)
                $this->rfFUNC($x + 1, $y, $player, $arr);
        }
    }

    function reverseFloodFill(Player $player, $X, $Y, &$arr) {
        $this->rfFUNC($X, $Y, $player, $arr);
    }

    function fbbFUNC ($x, $y, Player $player, &$arr) {
        if ($arr[$y][$x] === 1 || $arr[$y][$x] === 2) {
            $arr[$y][$x] += 3;

            if (0 < $y)
                $this->fbbFUNC($x, $y - 1, $player, $arr);
            if ($y < count($arr)-1)
                $this->fbbFUNC($x, $y + 1, $player, $arr);
            if (0 < $x)
                $this->fbbFUNC($x - 1, $y, $player, $arr);
            if ($x < count($arr[0])-1)
                $this->fbbFUNC($x + 1, $y, $player, $arr);
        }
    }

    function floodByBarrier(Player $player, &$arr) {
        $X = $player->getBarrier()->getBeginPoint()->x - $player->getBarrier()->getMinPoint()->x + 1;
        $Y = $player->getBarrier()->getBeginPoint()->y - $player->getBarrier()->getMinPoint()->y + 1;
        $this->fbbFUNC($X, $Y, $player, $arr);
    }

    function checkForOtherPlayers(Player $player, $arr) {
        $points = [];

        for ($y = $player->getBarrier()->getMinPoint()->y; $y <= $player->getBarrier()->getMaxPoint()->y; $y++) {
            for ($x = $player->getBarrier()->getMinPoint()->x; $x <= $player->getBarrier()->getMaxPoint()->x; $x++) {
                $X = $x - $player->getBarrier()->getMinPoint()->x + 1;
                $Y = $y - $player->getBarrier()->getMinPoint()->y + 1;

                if ($arr[$Y][$X] == 4) {
                    foreach ($this->players as $p) {
                        if($p instanceof Player) {
                            if ($p->getX() == $x && $p->getY() == $y && !$p->isDead()) {
                                $v = new Vector();
                                $v->x = $X;
                                $v->y = $Y;
                                array_push($points, $v);
                            }
                        }
                    }
                }
            }
        }

        return $points;
    }

    function renewTiles(Player $player, $arr) {
        for ($y = $player->getBarrier()->getMinPoint()->y; $y <= $player->getBarrier()->getMaxPoint()->y; $y++) {
            for ($x = $player->getBarrier()->getMinPoint()->x; $x <= $player->getBarrier()->getMaxPoint()->x; $x++) {
                $X = $x - $player->getBarrier()->getMinPoint()->x + 1;
                $Y = $y - $player->getBarrier()->getMinPoint()->y + 1;

                $tile = $this->playingField[$y][$x];

                if($tile instanceof Tile) {
                    if ($arr[$Y][$X] === 4 || $arr[$Y][$X] === 5) {
                        $tile->setBarrier(null);
                        $tile->setOccupier($player->getId());
                    } else if ($arr[$Y][$X] === 0) {
                        $tile->setNew(false);
                        $tile->setLinked([null, null]);
                    }
                }
            }
        }
    }

    function updateTiles() {
        for ($y = 0; $y < count($this->playingField); $y++) {
            for ($x = 0; $x < count($this->playingField[$y]); $x++) {

                $tile = $this->prevPlayingField[$y][$x];

                if($tile instanceof Tile) {
                    if(!$tile->equals($this->playingField[$y][$x])) {
                        $v = new Vector();
                        $v->x = $x;
                        $v->y = $y;
                        array_push($this->updatedTiles, [json_encode($v) => $this->playingField[$y][$x]]);

                        $this->prevPlayingField[$y][$x] = clone $this->playingField[$y][$x];
                    }
                }
            }
        }
    }

    function calcScore(Player $player) {
        $score = static::KILL_SCORE * $player->getKills();
        foreach ($this->playingField as $row) {
            foreach ($row as $tile) {
                if($tile instanceof Tile) {
                    if($tile->getOccupier() === $player->getId()) {
                        $score++;
                    }
                }
            }
        }

        return $score;
    }

    function onEnterField(Player $player) {
        $this->completePath($player);
        $this->setBarrierAsOccupied($player);
        $fieldFlood = $this->copyAsNumArr($player);
        $this->reverseFloodFill($player, 0, 0, $fieldFlood);
        $this->floodByBarrier($player, $fieldFlood);

        //echo json_encode($fieldFlood) . "\n";

        $points = $this->checkForOtherPlayers($player, $fieldFlood);

        foreach ($points as $point) {
            $this->reverseFloodFill($player, $point->x, $point->y, $fieldFlood);
        }

        $this->renewTiles($player, $fieldFlood);
        $player->setScore($this->calcScore($player));
    }

    function onWander(Player $player, $X, $Y) {
        $tile = $this->playingField[$Y][$X];

        if($tile instanceof Tile) {
            $tile->setBarrier($player->getId());
        }

        $y = $player->getMovementY();
        $x = $player->getMovementX();

        $tile = $this->playingField[$Y - $y][$X - $x];
        $tileLinked = $this->playingField[$Y][$X];

        if($tile instanceof Tile && $tileLinked instanceof Tile) {
            if ($tile->getOccupier() !== $player->getId()) {
                $tile->setSecondLinked($this->directionCoorToInt($x, $y));
                $y *= -1;
                $x *= -1;
                $tileLinked->setFirstLinked($this->directionCoorToInt($x, $y));
            }
        }

        if ($X < $player->getBarrier()->getMinPoint()->x) {
            $player->getBarrier()->getMinPoint()->x = $X;
        }

        if ($Y < $player->getBarrier()->getMinPoint()->y) {
            $player->getBarrier()->getMinPoint()->y = $Y;
        }

        if ($player->getBarrier()->getMaxPoint()->x < $X) {
            $player->getBarrier()->getMaxPoint()->x = $X;
        }

        if ($player->getBarrier()->getMaxPoint()->y < $Y) {
            $player->getBarrier()->getMaxPoint()->y = $Y;
        }
    }

    function headOnCollision() {
        //todo
        return false;
    }

    public function barrierStuff(Player $player)
    {
        $X = $player->getX();
        $Y = $player->getY();

        if (0 <= $X && $X < static::MAP_SIZE && 0 <= $Y && $Y < static::MAP_SIZE) {
            $tile = $this->playingField[$Y][$X];
            if($tile instanceof Tile) {
                if($this->headOnCollision()) {
                    echo "HEAD COLLSION" . "\n";
                } else if ($tile->getBarrier() === $player->getId() && !($player->getMovementX() == 0 && $player->getMovementY() == 0)) {
                    // when player hits his own tail
                    echo "Dies here: " . $tile->getBarrier() . "\n";
                    $this->diePlayer($X, $Y, $player);
                    $player->increaseKills();
                    $player->increaseScore(static::KILL_SCORE);
                } else if ($tile->getBarrier() !== null && $tile->getBarrier() !== $player->getId()) {
                    // when player hits someone's tail
                    $tile->setSecondLinked(null);
                    $this->diePlayer($X, $Y, $this->getPlayerById($tile->getBarrier()));
                    $player->increaseKills();
                    $player->increaseScore(static::KILL_SCORE);
                }

                if (($tile->getOccupier() !== $player->getId()) && $player->getBarrier()->isOnOwnField()) {
                    // when you leave your field
                    $this->setPlayerBarrier($player, $X, $Y, true);
                    $this->onLeaveField($player, $X, $Y);

                } else if (($tile->getOccupier() === $player->getId()) && !$player->getBarrier()->isOnOwnField()) {
                    // when you enter your field
                    $this->setPlayerBarrier($player, $X, $Y, false);
                    $this->onEnterField($player);
                }

                if ($tile->getOccupier() !== $player->getId() && !(0 == $player->getMovementY() && 0 == $player->getMovementX())) {
                    // when you are wandering over other fields and empty tiles
                    $this->onWander($player, $X, $Y);
                }
            }
        } else {
            $this->diePlayer($X, $Y, $player);
        }
    }

    public function frame() {
        foreach ($this->players as $player) {
            if($player instanceof Player) {
                if(!$player->isDead()) {
                    $player->move();
                    $this->barrierStuff($player);
                }
            }
        }
    }

    function applyDeath(Player $player) {
        foreach ($this->playingField as $row) {
            foreach ($row as $tile) {
                if($tile instanceof Tile) {
                    if ($tile->getBarrier() === $player->getId()) {
                        $tile->setBarrier(null);
                        $tile->setLinked([null, null]);
                    } else if ($tile->getOccupier() === $player->getId()) {
                        $tile->setOccupier(null);
                    }
                }
            }
        }
    }

    function removeDeadPlayers() {
        for($i=count($this->players)-1; $i>=0; $i--) {
            $player = $this->players[$i];

            if($player instanceof Player) {
                if($player->isDeadFor50Cycles()) {
                    array_splice($this->players, $i, 1);
                }
            }
        }

        //echo json_encode($this->players) . "\n";
    }

    public function update() {
        //$this->prevPlayingField = array_slice($this->playingField, 0);
        $this->updatedTiles = [];

        $this->frame();
        $this->frameCount = ($this->frameCount+1) % 1;

        $this->updateTiles();

        if($this->frameCount == 0) {
            $this->sendUpdate();
        }

        foreach ($this->players as $player) {
            if($player instanceof Player) {
                if($player->isDead()) {
                    $this->applyDeath($player);
                }
            }
        }

        $this->removeDeadPlayers();

        $this->tryAndUpdateHighscore();
    }

    private function sendUpdate() {
        //echo "Updated " . date("H:i:s.u") . "\n";

        foreach ($this->players as $player) {
            if($player instanceof Player) {
                $player->getConnection()->send(json_encode([
                    "address" => "blix.actions.update",
                    "updatedTiles" => $this->updatedTiles,
                    "players" => $this->players //,
                    //"timestamp" => microtime(true)
                ]));
            }
        }
    }

//    private function sendPlayerUpdate() {
//        foreach ($this->players as $player) {
//            if($player instanceof Player) {
//                $player->getConnection()->send(json_encode([
//                    "address" => "blix.actions.update.players",
//                    "players" => $this->players,
//                    "timestamp" => microtime(true)
//                ]));
//            }
//        }
//    }

    function addPlayer($name, $connection) : Player {
        array_push($this->players, new Player($name, $connection));

        return $this->players[count($this->players)-1];
    }

    function spawnPlayer(Player $player) {
        $halfSpawn = floor(static::SPAWN_SIZE / 2);

        $x = rand(0 + $halfSpawn, (static::MAP_SIZE - 1) - $halfSpawn);
        $y = rand(0 + $halfSpawn, (static::MAP_SIZE - 1) - $halfSpawn);

        $player->setX($x);
        $player->setY($y);

        for($y = $player->getY() - $halfSpawn; $y <= $player->getY() + $halfSpawn; $y++) {
            if (0 <= $y && $y < static::MAP_SIZE) {
                for($x = $player->getX() - $halfSpawn; $x <= $player->getX() + $halfSpawn; $x++) {
                    if (0 <= $x && $x < static::MAP_SIZE) {
                        $tile = $this->playingField[$y][$x];

                        if($tile instanceof Tile) {
                            $tile->setOccupier($player->getId());
                        }
                    }
                }
            }
        }

        $player->setScore(static::SPAWN_SIZE * static::SPAWN_SIZE);
    }

    function removeUser($connection) {
        $this->players = array_filter($this->players, array(new ConnectionFilter($connection), 'notEquals'));
        $this->logPlayers();
    }

    function diePlayerByConnection($connection) {
        $players = array_filter($this->players, array(new ConnectionFilter($connection), 'equals'));

        foreach ($players as $p) {
            if($p instanceof Player) {
                //$this->diePlayer($p->getX(), $p->getY(), $p);
                $this->getPlayerById($p->getId())->setDead(true);
            }
        }

        $this->logPlayers();
        foreach ($this->players as $p) {
            if($p instanceof Player) {
                echo "isDead: " . $p->isDead() . "\n";
            }
        }
    }

    function sortPlayerByScore(Player $p1, Player $p2) {
        return $p2->getScore() - $p1->getScore();
    }

    function tryAndUpdateHighscore()
    {
        try {
            // my data storage location is project_root/storage/app/data.json file.
            $allData = Storage::disk('local')->exists('data.json') ? json_decode(Storage::disk('local')->get('data.json'), true) : [];
            //var_dump($allData);

            $sortedPlayers = array_slice($this->players, 0);

            usort($sortedPlayers, [$this, "sortPlayerByScore"]);
            $p = array_get($sortedPlayers, 0, null);

            $highscore = 0;

            if($p instanceof Player) {
                $highscore = $p->getScore();
            }

            $allTimeHighScore = array_get($allData, "0.highscore", -1);

            if ($allTimeHighScore < $highscore) {
                echo "Adjusting all time highscore...\n";

                if(array_key_exists(0, $allData)) {
                    array_set($allData, "0.highscore", $highscore);
                } else {
                    array_push($allData, ["highscore" => $highscore]);
                    echo "Adding data...\n";
                }
            }

            Storage::disk('local')->put('data.json', json_encode($allData));

        } catch (Exception $e) {
            echo "ERROR : In tryAndUpdateHighscore\n";
        }
    }
}
