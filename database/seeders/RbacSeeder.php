<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;
use App\Models\User;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // system
            ['key' => 'manage_roles',   'name' => 'Manage Roles & Permissions'],
            ['key' => 'manage_users',   'name' => 'Manage Users'],
            // boards
            ['key' => 'manage_boards',  'name' => 'Manage Boards'],
            ['key' => 'manage_members', 'name' => 'Manage Board Members'],
            // epics/stories/tasks
            ['key' => 'create_epic',    'name' => 'Create Epic'],
            ['key' => 'update_epic',    'name' => 'Update Epic'],
            ['key' => 'create_story',   'name' => 'Create Story'],
            ['key' => 'update_story',   'name' => 'Update Story'],
            ['key' => 'create_task',    'name' => 'Create Task'],
            ['key' => 'update_task',    'name' => 'Update Task'],
            // misc
            ['key' => 'view_history',   'name' => 'View History'],
            ['key' => 'view_monitoring','name' => 'View Monitoring'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(
                ['key' => $p['key']],
                ['name' => $p['name']]
            );
        }

        // Roles default
        $admin = Role::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin', 'description' => 'Full access']
        );

        $pm = Role::firstOrCreate(
            ['slug' => 'pm'],
            ['name' => 'Project Manager', 'description' => 'Manage boards, epics, stories']
        );

        $dev = Role::firstOrCreate(
            ['slug' => 'developer'],
            ['name' => 'Developer', 'description' => 'Work on tasks']
        );

        $qa = Role::firstOrCreate(
            ['slug' => 'qa'],
            ['name' => 'QA', 'description' => 'Review & verify tasks']
        );

        // Attach permissions
        $allPermIds = Permission::query()->pluck('id')->all();
        $admin->permissions()->sync($allPermIds);

        $pm->permissions()->sync(
            Permission::query()->whereIn('key', [
                'manage_boards','manage_members',
                'create_epic','update_epic',
                'create_story','update_story',
                'create_task','update_task',
                'view_history','view_monitoring',
                'manage_users',
            ])->pluck('id')->all()
        );

        $dev->permissions()->sync(
            Permission::query()->whereIn('key', [
                'create_task','update_task',
                'view_history','view_monitoring',
            ])->pluck('id')->all()
        );

        $qa->permissions()->sync(
            Permission::query()->whereIn('key', [
                'update_task',
                'view_history','view_monitoring',
            ])->pluck('id')->all()
        );

        // Assign admin to first user
        $firstUser = User::query()->orderBy('id')->first();
        if ($firstUser) {
            $firstUser->roles()->syncWithoutDetaching([$admin->id]);
        }
    }
}
