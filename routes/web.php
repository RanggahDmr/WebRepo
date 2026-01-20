<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EpicPageController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\HistoryController;

Route::get('/', fn () => redirect()->route('dashboard'));

/*
|--------------------------------------------------------------------------
| Guest
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.store');
});

/*
|--------------------------------------------------------------------------
| Authenticated
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {

    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // Dashboard
    Route::get('/dashboard', [EpicPageController::class, 'index'])
        ->name('dashboard');

    // Epic & Story view (read-only)
    Route::get('/epics/{epic}', [EpicPageController::class, 'show'])
        ->name('epics.show');

    Route::get('/stories/{story}', [StoryController::class, 'show'])
        ->name('stories.show');

    // History
    Route::get('/history', [HistoryController::class, 'index'])
        ->name('history.index');

    //Monitoring
    Route::get('/monitoring', [MonitoringController::class, 'index'])
    ->name('monitoring.index');



    // Task board
    Route::get('/stories/{story}/tasks', [TaskController::class, 'index'])
        ->name('tasks.index');

   
    Route::middleware('role:PM')->group(function () {

        // Epic
        Route::post('/epics', [EpicPageController::class, 'store'])
            ->name('epics.store');

        Route::patch('/epics/{epic}', [EpicPageController::class, 'update'])
            ->name('epics.update');

        // Story
        Route::patch('/stories/{story}', [EpicPageController::class, 'updateStory'])
            ->name('stories.update');
    });

    /*
    |--------------------------------------------------------------------------
    | PM + SAD (Story create)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:PM,SAD')->group(function () {

        Route::post('/epics/{epic}/stories', [EpicPageController::class, 'storeStory'])
            ->name('stories.store');
    });

    /*
    |--------------------------------------------------------------------------
    | PM + SAD + PROGRAMMER (Task create)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:PM,SAD,PROGRAMMER')->group(function () {

        Route::post('/stories/{story}/tasks', [TaskController::class, 'store'])
            ->name('tasks.store');
    });

    /*
    |--------------------------------------------------------------------------
    | Task update (DnD / status)
    |--------------------------------------------------------------------------
    */
    Route::patch('/tasks/{task}', [TaskController::class, 'update'])
        ->name('tasks.update');



});
