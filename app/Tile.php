<?php
/**
 * Created by PhpStorm.
 * User => brend
 * Date => 7/12/2018
 * Time => 12 =>13
 */

namespace App;


class Tile implements \JsonSerializable
{
    private $occupier = null;
    private $new = false;
    private $barrier = null;
    private $linked = [null, null]; //0: right, 1: down, 2: left, 3: left

    function __construct()
    {
    }

    /**
     * @return null
     */
    public function getOccupier()
    {
        return $this->occupier;
    }

    /**
     * @return bool
     */
    public function isNew(): bool
    {
        return $this->new;
    }

    /**
     * @return null
     */
    public function getBarrier()
    {
        return $this->barrier;
    }

    /**
     * @return array
     */
    public function getLinked(): array
    {
        return $this->linked;
    }

    /**
     * @param null $occupier
     */
    public function setOccupier($occupier)
    {
        $this->occupier = $occupier;
    }

    /**
     * @param null $barrier
     */
    public function setBarrier($barrier)
    {
        $this->barrier = $barrier;
    }

    /**
     * @param bool $new
     */
    public function setNew(bool $new)
    {
        $this->new = $new;
    }

    /**
     * @param array $linked
     */
    public function setLinked(array $linked)
    {
        $this->linked = $linked;
    }

    public function setSecondLinked($sl) {
        $this->linked[1] = $sl;
    }

    public function setFirstLinked($sl) {
        $this->linked[0] = $sl;
    }

    /**
     * Specify data which should be serialized to JSON.
     *
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     *
     * @return mixed data which can be serialized by <b>json_encode</b>,
     *               which is a value of any type other than a resource.
     *
     * @since 5.4.0
     */
    public function jsonSerialize()
    {
        /*
         * occupier = floor(asNum / (4*4*MAX_PLAYERS))
         * barrier = floor((asNum % (4*4*MAX_PLAYERS*occupier)) / (4*4))
         * linked[0] = floor(((asNum % (4*4*MAX_PLAYERS*occupier)) % (4*4*barrier)) / 4)
         * linked[1] = ((asNum % (4*4*MAX_PLAYERS*occupier)) % (4*4*barrier)) % (4*linked[0])
         */

        $l1 = $this->linked[1] === null ? 1 : $this->linked[1] + 2;
        $l0 = $this->linked[0] === null ? 1 : $this->linked[0] + 2;
        $bb = $this->barrier === null ? 1 : $this->barrier + 2;
        $oo = $this->occupier === null ? 1 : $this->occupier + 2;

        $asNum = $l1 + 6*$l0 + 6*6*$bb + 6*6*(Game::MAX_PLAYERS+2)*$oo;
        return [$asNum];
    }

    public function __clone()
    {
        $this->linked = array_slice($this->linked, 0);
    }

    public function equals(Tile $tile)
    {
        $equals = true;

        if($tile->getOccupier() !== $this->getOccupier()) {
            $equals = false;
        }

        if($tile->getBarrier() !== $this->getBarrier()) {
            $equals = false;
        }

        if($tile->getLinked()[0] !== $this->getLinked()[0] || $tile->getLinked()[1] !== $this->getLinked()[1]) {
            $equals = false;
        }

        return $equals;
    }
}