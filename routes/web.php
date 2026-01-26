<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EpicPageController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\MonitoringController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\BoardMonitoringController;



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
    Route::get('/dashboard', [BoardController::class, 'index'])->name('dashboard');

    // Route::get('/dashboard', [EpicPageController::class, 'index'])
    //     ->name('dashboard');

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
     Route::get('/monitoring/tasks',   [MonitoringController::class, 'tasks'])->name('monitoring.tasks');
     Route::get('/monitoring', [\App\Http\Controllers\MonitoringController::class, 'index'])
    ->name('monitoring.index');

    // Route::get('/monitoring/epics',   [MonitoringController::class, 'epics'])->name('monitoring.epics');
    // Route::get('/monitoring/stories', [MonitoringController::class, 'stories'])->name('monitoring.stories');


    //boards
    
    Route::get('/boards/{board}', [BoardController::class, 'show'])->name('boards.show'); // redirect aja


    // create board (PM only)
    Route::post('/boards', [BoardController::class, 'store'])->name('boards.store');
    Route::get('/boards/{board}/epics', [EpicPageController::class, 'index'])
    ->name('epics.index');



    // Task board
    Route::get('/stories/{story}/tasks', [TaskController::class, 'index'])
        ->name('tasks.index');

     Route::patch('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');


   
    Route::middleware('role:PM')->group(function () {

        // Epic
       

        Route::post('/boards/{board}/epics', [EpicPageController::class, 'store'])
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
