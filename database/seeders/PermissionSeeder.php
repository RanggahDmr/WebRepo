<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
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

        foreach ($permissions as $p) {
            Permission::firstOrCreate(
                ['key' => $p['key']],
                ['name' => $p['name'], 'description' => $p['description'] ?? null]
            );
        }

        // attach all permissions to admin roles (safe)
        $allPermissionIds = Permission::pluck('id')->all();

        // if you use 'super_admin'
        $super = Role::firstOrCreate(['slug' => 'super_admin'], ['name' => 'Super Admin']);
        $super->permissions()->syncWithoutDetaching($allPermissionIds);

        // if you use 'admin'
        $admin = Role::firstOrCreate(['slug' => 'admin'], ['name' => 'Admin']);
        $admin->permissions()->syncWithoutDetaching($allPermissionIds);
    }
}
