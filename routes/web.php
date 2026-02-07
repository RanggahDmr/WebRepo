<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;

use App\Http\Controllers\BoardController;
use App\Http\Controllers\BoardMemberController;

use App\Http\Controllers\EpicPageController;
use App\Http\Controllers\StoryController;
use App\Http\Controllers\TaskController;

use App\Http\Controllers\HistoryController;
use App\Http\Controllers\MonitoringController;

use App\Http\Controllers\UserRoleController;

use App\Http\Controllers\RoleController;

use App\Http\Controllers\BoardSettingsController;



Route::get('/', fn () => redirect()->route('dashboard'));



Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.store');

    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store'])->name('register.store');
});


/*
|--------------------------------------------------------------------------|
| Authenticated
|--------------------------------------------------------------------------|
*/
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // Admin
    Route::middleware(['role.ready', 'perm:manage_roles'])->group(function () {
        Route::get('/admin/users/active', [UserRoleController::class, 'active'])
        ->name('admin.users.active');

    Route::get('/admin/users/pending', [UserRoleController::class, 'pending'])
        ->name('admin.users.pending');
        Route::patch('/admin/users/{user}/role', [UserRoleController::class, 'update'])->name('admin.users.role.update');
        Route::delete('/admin/users/{user}', [UserRoleController::class, 'destroy'])->name('admin.users.destroy');

        Route::get('/admin/roles', [RoleController::class, 'index'])->name('admin.roles.index');
        Route::post('/admin/roles', [RoleController::class, 'store'])->name('admin.roles.store');
        Route::patch('/admin/roles/{role}', [RoleController::class, 'update'])->name('admin.roles.update');
        Route::delete('/admin/roles/{role}', [RoleController::class, 'destroy'])->name('admin.roles.destroy');
        Route::patch('/admin/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])
            ->name('admin.roles.permissions.sync');
       
          Route::get('/boards/{board}/settings', [BoardSettingsController::class, 'index'])
        ->name('boards.settings');

            Route::post('/boards/{board}/settings/statuses', [BoardSettingsController::class, 'storeStatus'])
                ->name('boards.settings.statuses.store');

            Route::put('/boards/{board}/settings/statuses/{status}', [BoardSettingsController::class, 'updateStatus'])
                ->name('boards.settings.statuses.update');

            Route::delete('/boards/{board}/settings/statuses/{status}', [BoardSettingsController::class, 'deleteStatus'])
                ->name('boards.settings.statuses.delete');

            Route::post('/boards/{board}/settings/statuses/reorder', [BoardSettingsController::class, 'reorderStatuses'])
                ->name('boards.settings.statuses.reorder');

            // priorities
            Route::post('/boards/{board}/settings/priorities', [BoardSettingsController::class, 'storePriority'])
                ->name('boards.settings.priorities.store');

            Route::put('/boards/{board}/settings/priorities/{priority}', [BoardSettingsController::class, 'updatePriority'])
                ->name('boards.settings.priorities.update');

            Route::delete('/boards/{board}/settings/priorities/{priority}', [BoardSettingsController::class, 'deletePriority'])
                ->name('boards.settings.priorities.delete');

            Route::post('/boards/{board}/settings/priorities/reorder', [BoardSettingsController::class, 'reorderPriorities'])
                ->name('boards.settings.priorities.reorder');
            });
                });

    // App
    Route::middleware('role.ready')->group(function () {
        Route::get('/dashboard', [BoardController::class, 'index'])->name('dashboard');

        // boards
        Route::post('/boards', [BoardController::class, 'store'])
            ->middleware('perm:manage_boards')
            ->name('boards.store');

        Route::get('/boards/{board}', [BoardController::class, 'show'])
            ->name('boards.show');

        Route::delete('/boards/{board}', [BoardController::class, 'destroy'])
            ->middleware('perm:deleted_boards')
            ->name('boards.destroy');

        // board members
        Route::post('/boards/{board}/members', [BoardMemberController::class, 'store'])
            ->middleware('perm:manage_members')
            ->name('boards.members.store');

        Route::delete('/boards/{board}/members/{user}', [BoardMemberController::class, 'destroy'])
            ->middleware('perm:deleted_members')
            ->name('boards.members.destroy');

        // epics / stories / tasks (sementara tetap)
        Route::get('/boards/{board}/epics', [EpicPageController::class, 'index'])->name('epics.index');
        Route::get('/epics/{epic}', [EpicPageController::class, 'show'])->name('epics.show');

        Route::post('/boards/{board}/epics', [EpicPageController::class, 'store'])
            ->middleware('perm:create_epic')
            ->name('epics.store');

        Route::patch('/epics/{epic}', [EpicPageController::class, 'update'])
            ->middleware('perm:update_epic')
            ->name('epics.update');

        Route::delete('/epics/{epic}', [EpicPageController::class, 'destroy'])
            ->middleware('perm:deleted_epic') // sementara
            ->name('epics.destroy');

        Route::get('/stories/{story}', [StoryController::class, 'show'])->name('stories.show');

        Route::post('/epics/{epic}/stories', [EpicPageController::class, 'storeStory'])
            ->middleware('perm:create_story')
            ->name('stories.store');

        Route::patch('/stories/{story}', [EpicPageController::class, 'updateStory'])
            ->middleware('perm:update_story')
            ->name('stories.update');

        Route::delete('/stories/{story}', [EpicPageController::class, 'destroyStory'])
            ->middleware('perm:deleted_story') // sementara
            ->name('stories.destroy');

        Route::get('/stories/{story}/tasks', [TaskController::class, 'index'])->name('tasks.index');

        Route::post('/stories/{story}/tasks', [TaskController::class, 'store'])
            ->middleware('perm:create_task')
            ->name('tasks.store');

        Route::patch('/tasks/{task}', [TaskController::class, 'update'])
            ->middleware('perm:update_task')
            ->name('tasks.update');

        Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])
            ->middleware('perm:deleted_task') // sementara
            ->name('tasks.destroy');

        // history / monitoring
        // history / monitoring
        Route::get('/history', [HistoryController::class, 'index'])
            ->middleware('perm:view_history')
            ->name('history.index');

        Route::get('/monitoring', [MonitoringController::class, 'index'])
            ->middleware('perm:view_monitoring')
            ->name('monitoring.index');


            

     
    });

