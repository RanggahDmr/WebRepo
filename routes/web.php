<?php

use App\Http\Controllers\EpicPageController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;


Route::get('/', fn () => redirect()->route('dashboard'));

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.store');
});

Route::post('/logout', [LoginController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [EpicPageController::class, 'index'])->name('dashboard');
    Route::get('/epics/{epic}', [EpicPageController::class, 'show'])->name('epics.show');

    Route::post('/epics', [EpicPageController::class, 'store'])
        ->middleware('role:PM')
        ->name('epics.store');

    Route::patch('/epics/{epic}', [EpicController::class, 'dashboardUpdate'])
        ->middleware('role:PM')
        ->name('epics.update');

    Route::patch('/epics/{epic}', [EpicPageController::class, 'update'])
        ->middleware('role:PM')
        ->name('epics.update');

});

Route::middleware(['auth'])->group(function () {
    Route::get('/epics/{epic}', [EpicPageController::class, 'Show'])
        ->name('epics.show');
        // Story create (PM only)
    Route::post('/epics/{epic}/stories', [EpicPageController::class, 'storeStory'])
        ->middleware('role:PM')
        ->name('epics.stories.store');

    // Story update (PM only)
    Route::patch('/stories/{story}', [EpicPageController::class, 'updateStory'])
        ->middleware('role:PM')
        ->name('stories.update');
});

