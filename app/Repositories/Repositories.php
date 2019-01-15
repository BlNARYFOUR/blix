<?php
/**
 * Created by PhpStorm.
 * User: brend
 * Date: 28/11/2018
 * Time: 11:25
 */

namespace App\Repositories;


class Repositories
{
    public static function getInstance() {
        static $instance = null;

        if ($instance === null) {
            $instance = new Repositories();
        }
        return $instance;
    }

    private function __construct() {
    }
}