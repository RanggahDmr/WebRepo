<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;
use App\Models\Permission;
use App\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // RBAC admin
            ['name' => 'Manage Roles & Permissions', 'key' => 'manage_roles'],
            ['name' => 'Manage Users', 'key' => 'manage_users'],

            // Boards
            ['name' => 'Manage Boards', 'key' => 'manage_boards'],
            ['name' => 'Manage Board Members', 'key' => 'manage_members'],
            ['name' => 'Manage Board Settings', 'key' => 'manage_board_settings'],

            // Work items
            ['name' => 'Create Epic', 'key' => 'create_epic'],
            ['name' => 'Update Epic', 'key' => 'update_epic'],
            ['name' => 'Delete Epic', 'key' => 'delete_epic'],

            ['name' => 'Create Story', 'key' => 'create_story'],
            ['name' => 'Update Story', 'key' => 'update_story'],
            ['name' => 'Delete Story', 'key' => 'delete_story'],

            ['name' => 'Create Task', 'key' => 'create_task'],
            ['name' => 'Update Task', 'key' => 'update_task'],
            ['name' => 'Delete Task', 'key' => 'delete_task'],

            // Monitoring / history
            ['name' => 'View Monitoring', 'key' => 'view_monitoring'],
            ['name' => 'View History', 'key' => 'view_history'],

            // Global masters
            ['name' => 'Manage Global Statuses', 'key' => 'manage_global_statuses'],
            ['name' => 'Manage Global Priorities', 'key' => 'manage_global_priorities'],
            ['name' => 'Manage Global Defaults', 'key' => 'manage_global_defaults'],
        ];

        // if permissions table exists
        if (Schema::hasTable('permissions')) {
            foreach ($permissions as $p) {
                Permission::firstOrCreate(
                    ['key' => $p['key']],
                    ['name' => $p['name'], 'description' => $p['description'] ?? null]
                );
            }
        }

        // attach to roles only if the needed tables exist
        $canAttach =
            Schema::hasTable('roles') &&
            Schema::hasTable('permissions') &&
            (
                Schema::hasTable('permission_role') || // common pivot name
                Schema::hasTable('role_permission') || // alt pivot name
                Schema::hasTable('role_permissions') || // alt pivot name
                Schema::hasTable('permission_roles')    // alt pivot name
            );

        if (! $canAttach) {
            return;
        }

        $allPermissionIds = Permission::pluck('id')->all();

        // Only attach if the relationship exists on Role model
        // (prevents error if Role doesn't define permissions())
        $roleHasPermissionsRel = method_exists(Role::class, 'permissions');

        // super_admin
        $super = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin']);
        if ($roleHasPermissionsRel) {
            $super->permissions()->syncWithoutDetaching($allPermissionIds);
        }

        // admin
        $admin = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        if ($roleHasPermissionsRel) {
            $admin->permissions()->syncWithoutDetaching($allPermissionIds);
        }
    }
}
