<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

/** @noinspection PhpUndefinedClassInspection */
Route::get('/', function () {
    return view('blix');
});

/** @noinspection PhpUndefinedClassInspection */
Route::get('/client', function () {
    return view('clientblix');
});
