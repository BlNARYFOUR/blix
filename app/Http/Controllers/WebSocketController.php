<?php

namespace App\Http\Controllers;

use App\Game;
use App\MessageHandler;
use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class WebSocketController extends Controller implements MessageComponentInterface
{
    private static $game;

    public function __construct()
    {
        $this::$game = new Game();
    }

    public function getGame() {
        return $this::$game;
    }

    function onOpen(ConnectionInterface $conn)
    {
        echo "Connection opened\n";
    }

    function onClose(ConnectionInterface $conn)
    {
        echo "Connection closed\n";

        if($this::$game instanceof Game) {
            //$this::$game->removeUser($conn);
            $this::$game->diePlayerByConnection($conn);
        }
    }

    function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "Error occurred: " . $e -> getMessage() . "\n";
    }

    function onMessage(ConnectionInterface $from, $msg)
    {
        echo "Message received: " . $msg . "\n";

        $jsonObj = json_decode($msg, true);
        $address = array_get($jsonObj, "address", null);
        $data = array_get($jsonObj, "data", null);
        MessageHandler::listen($address, $from, $data);
    }
}
