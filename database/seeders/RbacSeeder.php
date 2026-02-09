<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        // Guard minimal tables
        if (!Schema::hasTable('roles') || !Schema::hasTable('permissions')) {
            return;
        }

        $permissions = [
            // system
            ['key' => 'manage_roles',    'name' => 'Manage Roles & Permissions'],
            ['key' => 'manage_users',    'name' => 'Manage Users'],

            // boards
            ['key' => 'manage_boards',   'name' => 'Manage Boards'],
            ['key' => 'manage_members',  'name' => 'Manage Board Members'],

            // epics/stories/tasks (create/update)
            ['key' => 'create_epic',     'name' => 'Create Epic'],
            ['key' => 'update_epic',     'name' => 'Update Epic'],
            ['key' => 'create_story',    'name' => 'Create Story'],
            ['key' => 'update_story',    'name' => 'Update Story'],
            ['key' => 'create_task',     'name' => 'Create Task'],
            ['key' => 'update_task',     'name' => 'Update Task'],

            // delete permissions (separate)
            ['key' => 'delete_board',    'name' => 'Delete Board'],
            ['key' => 'delete_epic',     'name' => 'Delete Epic'],
            ['key' => 'delete_story',    'name' => 'Delete Story'],
            ['key' => 'delete_task',     'name' => 'Delete Task'],
            ['key' => 'delete_user',     'name' => 'Delete User'],
            ['key' => 'delete_role',     'name' => 'Delete Role'],

            // misc
            ['key' => 'view_history',    'name' => 'View History'],
            ['key' => 'view_monitoring', 'name' => 'View Monitoring'],
        ];

        // permissions (idempotent) - only if permissions table exists (already guarded above)
        foreach ($permissions as $p) {
            Permission::updateOrCreate(
                ['key' => $p['key']],
                ['name' => $p['name']]
            );
        }

        // Roles default
        $admin = Role::updateOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin', 'description' => 'Full access']
        );

        $pm = Role::updateOrCreate(
            ['slug' => 'pm'],
            ['name' => 'Project Manager', 'description' => 'Manage boards, epics, stories, tasks']
        );

        $dev = Role::updateOrCreate(
            ['slug' => 'developer'],
            ['name' => 'Developer', 'description' => 'Work on tasks']
        );

        $qa = Role::updateOrCreate(
            ['slug' => 'qa'],
            ['name' => 'QA', 'description' => 'Review & verify tasks']
        );

        // ---- Attach permissions only if pivot + relationship exist ----
        $hasRolePermissionPivot =
            Schema::hasTable('permission_role') ||   // common
            Schema::hasTable('role_permission') ||   // alt
            Schema::hasTable('role_permissions') ||  // alt
            Schema::hasTable('permission_roles');    // alt

        $roleHasPermRel = method_exists(Role::class, 'permissions');

        if ($hasRolePermissionPivot && $roleHasPermRel) {
            // Admin gets all permissions
            $allPermIds = Permission::query()->pluck('id')->all();
            $admin->permissions()->sync($allPermIds);

            // PM permissions
            $pmKeys = [
                'manage_boards','manage_members',

                'create_epic','update_epic',
                'create_story','update_story',
                'create_task','update_task',

                'delete_board','delete_epic','delete_story','delete_task',

                'view_history','view_monitoring',

                // optional
                'manage_users',
            ];
            $pm->permissions()->sync(
                Permission::query()->whereIn('key', $pmKeys)->pluck('id')->all()
            );

            // Developer
            $devKeys = [
                'create_task','update_task',
                'view_history','view_monitoring',
            ];
            $dev->permissions()->sync(
                Permission::query()->whereIn('key', $devKeys)->pluck('id')->all()
            );

            // QA
            $qaKeys = [
                'update_task',
                'view_history','view_monitoring',
            ];
            $qa->permissions()->sync(
                Permission::query()->whereIn('key', $qaKeys)->pluck('id')->all()
            );
        }

        // ---- Assign admin to first user (if users + pivot + relation exist) ----
        if (!Schema::hasTable('users')) {
            return;
        }

        $hasUserRolePivot =
            Schema::hasTable('user_roles') ||      // common
            Schema::hasTable('role_user') ||       // laravel default
            Schema::hasTable('user_role') ||       // alt
            Schema::hasTable('users_roles');       // alt

        $userHasRolesRel = method_exists(User::class, 'roles');

        if ($hasUserRolePivot && $userHasRolesRel) {
            $firstUser = User::query()->orderBy('id')->first();
            if ($firstUser) {
                $firstUser->roles()->syncWithoutDetaching([$admin->id]);
            }
        }
    }
}
