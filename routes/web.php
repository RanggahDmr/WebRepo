<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EpicPageController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\TaskController;



Route::get('/', fn () => redirect()->route('dashboard'));

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.store');
});


Route::middleware('auth')->group(function () {

    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');


    Route::get('/dashboard', [EpicPageController::class, 'index'])
        ->name('dashboard');

    Route::get('/epics/{epic}', [EpicPageController::class, 'show'])
        ->name('epics.show');

 
    Route::middleware('role:PM')->group(function () {

        Route::post('/epics', [EpicPageController::class, 'store'])
            ->name('epics.store');

        Route::patch('/epics/{epic}', [EpicPageController::class, 'update'])
            ->name('epics.update');

        Route::post('/epics/{epic}/stories', [EpicPageController::class, 'storeStory'])
            ->name('stories.store');

        Route::patch('/stories/{story}', [EpicPageController::class, 'updateStory'])
            ->name('stories.update');
    });

   
Route::get('/stories/{story}', [StoryController::class, 'show'])
  ->name('stories.show');


Route::get(
    '/stories/{story}/tasks',
    [TaskController::class, 'index']
)->name('tasks.index');



});
