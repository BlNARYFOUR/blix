<?php
/**
 * Created by PhpStorm.
 * User: brend
 * Date: 7/12/2018
 * Time: 9:50
 */

namespace App;


class ConnectionFilter
{
    private $connection;

    function __construct($connection) {
        $this->connection = $connection;
    }

    function equals(Player $player) {
        return $player->getConnection() == $this->connection;
    }

    function notEquals(Player $player) {
        return !$this->equals($player);
    }
}