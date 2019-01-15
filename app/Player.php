<?php

namespace App;


use Ratchet\ConnectionInterface;

class Player implements \JsonSerializable
{
    private static $nextId = 0;

    private $name;
    private $id;
    private $connection;

    private $paused;
    private $x;
    private $y;
    private $prevMovementX;
    private $prevMovementY;
    private $movementX;
    private $movementY;

    private $score;
    private $kills;

    private $barrier;
    private $isDead;
    private $cycles;

    function __construct($name, $connection) {
        $this->id = Player::$nextId;
        Player::$nextId++;

        $this->name = $name;
        $this->connection = $connection;
        $this->paused = false;
        $this->x = 1;
        $this->y = 1;
        $this->prevMovementX = 0;
        $this->prevMovementY = 0;
        $this->movementX = 0;
        $this->movementY = 0;
        $this->score = 0;
        $this->kills = 0;
        $this->barrier = new Barrier();
        $this->isDead = false;
        $this->cycles = 0;
    }

    function getId() {
        return $this -> id;
    }

    function isDead() {
        return $this->isDead;
    }

    function isDeadFor50Cycles() {
        if($this->isDead()) {
            $this->cycles++;
            return $this->cycles == 50;
        } else {
            return false;
        }
    }

    function move() {
        $this->x += $this->movementX;
        $this->y += $this->movementY;
    }

    function getConnection() : ConnectionInterface {
        return $this -> connection;
    }

    /**
     * @return bool
     */
    public function isPaused(): bool
    {
        return $this->paused;
    }

    /**
     * @return int
     */
    public function getX(): int
    {
        return $this->x;
    }

    /**
     * @return int
     */
    public function getY(): int
    {
        return $this->y;
    }

    /**
     * @return int
     */
    public function getPrevMovementX(): int
    {
        return $this->prevMovementX;
    }

    /**
     * @return int
     */
    public function getPrevMovementY(): int
    {
        return $this->prevMovementY;
    }

    /**
     * @return int
     */
    public function getMovementX(): int
    {
        return $this->movementX;
    }

    /**
     * @return int
     */
    public function getMovementY(): int
    {
        return $this->movementY;
    }

    /**
     * @param bool $paused
     */
    private function setPaused(bool $paused)
    {
        $this->paused = $paused;
    }

    /**
     * @param int $movementX
     */
    private function setMovementX(int $movementX)
    {
        $this->movementX = $movementX;
    }

    /**
     * @param int $movementY
     */
    private function setMovementY(int $movementY)
    {
        $this->movementY = $movementY;
    }

    /**
     * @param int $prevMovementX
     */
    private function setPrevMovementX(int $prevMovementX)
    {
        $this->prevMovementX = $prevMovementX;
    }

    /**
     * @param int $prevMovementY
     */
    private function setPrevMovementY(int $prevMovementY)
    {
        $this->prevMovementY = $prevMovementY;
    }

    /**
     * @param int $x
     */
    public function setX(int $x)
    {
        $this->x = $x;
    }

    /**
     * @param int $y
     */
    public function setY(int $y)
    {
        $this->y = $y;
    }

    /**
     * @param int $score
     */
    public function setScore(int $score)
    {
        $this->score = $score;
    }

    public function increaseScore(int $score)
    {
        $this->score += $score;
    }

    public function increaseKills() {
        $this->kills++;
    }

    /**
     * @return int
     */
    public function getScore(): int
    {
        return $this->score;
    }

    /**
     * @return Barrier
     */
    public function getBarrier(): Barrier
    {
        return $this->barrier;
    }

    function goUp() {
        if (($this->isPaused() && $this->getPrevMovementY() <= 0) || (!$this->isPaused() && $this->getMovementY() <= 0)) {
            $this->setMovementX(0);
            $this->setMovementY(-1);

            $this->setPaused(false);
        }
    }

    function goDown() {
        if (($this->isPaused() && 0 <= $this->getPrevMovementY()) || (!$this->isPaused() && 0 <= $this->getMovementY())) {
            $this->setMovementX(0);
            $this->setMovementY(1);

            $this->setPaused(false);
        }
    }

    function goLeft() {
        if (($this->isPaused() && $this->getPrevMovementX() <= 0) || (!$this->isPaused() && $this->getMovementX() <= 0)) {
            $this->setMovementX(-1);
            $this->setMovementY(0);

            $this->setPaused(false);
        }
    }

    function goRight() {
        if (($this->isPaused() && 0 <= $this->getPrevMovementX()) || (!$this->isPaused() && 0 <= $this->getMovementX())) {
            $this->setMovementX(1);
            $this->setMovementY(0);

            $this->setPaused(false);
        }
    }

    function pause() {
        $this->setPaused(!$this->isPaused());

        if ($this->isPaused()) {
            $this->setPrevMovementX($this->getMovementX());
            $this->setPrevMovementY($this->getMovementY());

            $this->setMovementX(0);
            $this->setMovementY(0);
        } else {
            $this->setMovementX($this->getPrevMovementX());
            $this->setMovementY($this->getPrevMovementY());
        }
    }

    function stopMoving() {
        $this->setMovementX(0);
        $this->setMovementY(0);
    }

    function equals(Player $player) {
        return $this -> getId() == $player -> getId();
    }

    function __toString()
    {
        return "Player: [id => " . $this->id . ", name => " . $this->name . "]";
    }

    /**
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     * @since 5.4.0
     */
    public function jsonSerialize()
    {
        return get_object_vars($this);
    }

    public function setDead($isDead)
    {
        $this->isDead = $isDead;
    }
}