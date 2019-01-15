<?php
/**
 * Created by PhpStorm.
 * User: brend
 * Date: 4/12/2018
 * Time: 14:42
 */

namespace App;


class Barrier implements \JsonSerializable
{
    private $onOwnField;
    private $maxPoint;
    private $minPoint;
    private $beginPoint;
    private $endPoint;
    private $beginDirection;
    private $endDirection;

    function __construct()
    {
        $this->onOwnField = true;
        $this->maxPoint = new Vector();
        $this->minPoint = new Vector();
        $this->beginPoint = new Vector();
        $this->endPoint = new Vector();
        $this->beginDirection = new Vector();
        $this->endDirection = new Vector();

        $this->maxPoint->x = -1;
        $this->maxPoint->y = -1;
        $this->minPoint->x = Game::MAP_SIZE;
        $this->minPoint->y = Game::MAP_SIZE;
    }

    /**
     * @return bool
     */
    public function isOnOwnField(): bool
    {
        return $this->onOwnField;
    }

    /**
     * @param bool $onOwnField
     */
    public function setOnOwnField(bool $onOwnField)
    {
        $this->onOwnField = $onOwnField;
    }

    /**
     * @return Vector
     */
    public function getMaxPoint(): Vector
    {
        return $this->maxPoint;
    }

    /**
     * @param Vector $maxPoint
     */
    public function setMaxPoint(Vector $maxPoint)
    {
        $this->maxPoint = $maxPoint;
    }

    /**
     * @return Vector
     */
    public function getMinPoint(): Vector
    {
        return $this->minPoint;
    }

    /**
     * @param Vector $minPoint
     */
    public function setMinPoint(Vector $minPoint)
    {
        $this->minPoint = $minPoint;
    }

    /**
     * @return Vector
     */
    public function getBeginPoint(): Vector
    {
        return $this->beginPoint;
    }

    /**
     * @param Vector $beginPoint
     */
    public function setBeginPoint(Vector $beginPoint)
    {
        $this->beginPoint = $beginPoint;
    }

    /**
     * @return Vector
     */
    public function getEndPoint(): Vector
    {
        return $this->endPoint;
    }

    /**
     * @param Vector $endPoint
     */
    public function setEndPoint(Vector $endPoint)
    {
        $this->endPoint = $endPoint;
    }

    /**
     * @return Vector
     */
    public function getBeginDirection(): Vector
    {
        return $this->beginDirection;
    }

    /**
     * @param Vector $beginDirection
     */
    public function setBeginDirection(Vector $beginDirection)
    {
        $this->beginDirection = $beginDirection;
    }

    /**
     * @return Vector
     */
    public function getEndDirection(): Vector
    {
        return $this->endDirection;
    }

    /**
     * @param Vector $endDirection
     */
    public function setEndDirection(Vector $endDirection)
    {
        $this->endDirection = $endDirection;
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
}