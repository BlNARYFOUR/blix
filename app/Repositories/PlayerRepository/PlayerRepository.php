<?php

namespace App\Repositories\PlayerRepository;


use Ratchet\ConnectionInterface;

interface PlayerRepository
{
    function addPlayer($player, ConnectionInterface $connection);
}