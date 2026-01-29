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


Route::get('/', fn () => redirect()->route('dashboard'));

/*
|--------------------------------------------------------------------------
| Guest (Login/Register)
|--------------------------------------------------------------------------
*/
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

    /*
    |--------------------------------------------------------------------------|
    | Admin: Roles / Users (permission-based)
    |--------------------------------------------------------------------------|
    */
    Route::middleware(['role.ready', 'perm:manage_roles'])->group(function () {
        // users role assignment
        Route::get('/admin/users', [UserRoleController::class, 'index'])
            ->name('admin.users.index');

        Route::patch('/admin/users/{user}/role', [UserRoleController::class, 'update'])
            ->name('admin.users.role.update');

        Route::delete('/admin/users/{user}', [UserRoleController::class, 'destroy'])
            ->name('admin.users.destroy');

        // roles CRUD
        Route::get('/admin/roles', [RoleController::class, 'index'])
            ->name('admin.roles.index');

        Route::post('/admin/roles', [RoleController::class, 'store'])
            ->name('admin.roles.store');

        Route::patch('/admin/roles/{role}', [RoleController::class, 'update'])
            ->name('admin.roles.update');

        Route::delete('/admin/roles/{role}', [RoleController::class, 'destroy'])
            ->name('admin.roles.destroy');

        // optional: khusus save checklist permission
        Route::patch('/admin/roles/{role}/permissions', [RoleController::class, 'syncPermissions'])
            ->name('admin.roles.permissions.sync');
    });

    /*
    |--------------------------------------------------------------------------|
    | App Routes (wajib role)
    |--------------------------------------------------------------------------|
    */
    Route::middleware('role.ready')->group(function () {
        Route::get('/dashboard', [BoardController::class, 'index'])->name('dashboard');

        Route::post('/boards', [BoardController::class, 'store'])
            ->middleware('perm:manage_boards')
            ->name('boards.store');

        Route::get('/boards/{board}', [BoardController::class, 'show'])->name('boards.show');

        Route::post('/boards/{board}/members', [BoardMemberController::class, 'store'])
            ->middleware('perm:manage_members')
            ->name('boards.members.store');

        Route::delete('/boards/{board}/members/{user}', [BoardMemberController::class, 'destroy'])
            ->middleware('perm:manage_members')
            ->name('boards.members.destroy');

        Route::get('/boards/{board}/epics', [EpicPageController::class, 'index'])->name('epics.index');
        Route::get('/epics/{epic}', [EpicPageController::class, 'show'])->name('epics.show');

        Route::get('/stories/{story}', [StoryController::class, 'show'])->name('stories.show');

        Route::get('/stories/{story}/tasks', [TaskController::class, 'index'])->name('tasks.index');

        Route::patch('/tasks/{task}', [TaskController::class, 'update'])
            ->middleware('perm:update_task')
            ->name('tasks.update');

        Route::get('/history', [HistoryController::class, 'index'])
            ->middleware('perm:view_history')
            ->name('history.index');

        Route::get('/monitoring', [MonitoringController::class, 'index'])
            ->middleware('perm:view_monitoring')
            ->name('monitoring.index');

        Route::get('/monitoring/tasks', [MonitoringController::class, 'tasks'])
            ->middleware('perm:view_monitoring')
            ->name('monitoring.tasks');

        Route::post('/boards/{board}/epics', [EpicPageController::class, 'store'])
            ->middleware('perm:create_epic')
            ->name('epics.store');

        Route::patch('/epics/{epic}', [EpicPageController::class, 'update'])
            ->middleware('perm:update_epic')
            ->name('epics.update');

        Route::post('/epics/{epic}/stories', [EpicPageController::class, 'storeStory'])
            ->middleware('perm:create_story')
            ->name('stories.store');

        Route::patch('/stories/{story}', [EpicPageController::class, 'updateStory'])
            ->middleware('perm:update_story')
            ->name('stories.update');

        Route::post('/stories/{story}/tasks', [TaskController::class, 'store'])
            ->middleware('perm:create_task')
            ->name('tasks.store');

                    // Boards delete
        Route::delete('/boards/{board}', [BoardController::class, 'destroy'])
            ->middleware('perm:manage_boards')
            ->name('boards.destroy');

        // Epics delete
        Route::delete('/epics/{epic}', [EpicPageController::class, 'destroy'])
            ->middleware('perm:update_epic') // kalau belum punya delete_epic, sementara pakai ini
            ->name('epics.destroy');

        // Stories delete
        Route::delete('/stories/{story}', [EpicPageController::class, 'destroyStory'])
            ->middleware('perm:update_story') // sementara
            ->name('stories.destroy');

        // Tasks delete
        Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])
            ->middleware('perm:update_task') // sementara
            ->name('tasks.destroy');

            });
        Route::delete('/boards/{board}', [BoardController::class, 'destroy'])
        ->middleware('perm:manage_boards')
        ->name('boards.destroy');

        });

