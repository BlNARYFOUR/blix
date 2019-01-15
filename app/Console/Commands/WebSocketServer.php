<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;
use App\Http\Controllers\WebSocketController;

class WebSocketServer extends Command
{
    protected $signature = 'websocket:run';

    protected $description = 'Command description';

    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $wsc = new WebSocketController();

        $server = IoServer::factory(
            new HttpServer(
                new WsServer(
                    $wsc
                )
            ),
            4321
        );

        $server->loop->addPeriodicTimer(0.2, [$wsc->getGame(), "update"]);

        $server -> run();
    }
}
