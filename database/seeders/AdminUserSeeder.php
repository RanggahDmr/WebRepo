<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Guard: minimal tables must exist
        if (!Schema::hasTable('users') || !Schema::hasTable('roles')) {
            return;
        }

        // pastiin role admin ada (dari RbacSeeder harusnya sudah ada)
        $adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin', 'description' => 'Full access']
        );

        // kredensial admin yang kamu tau
        $email = 'admin@webrepo.test';
        $passwordPlain = 'password'; // ganti kalau mau, misal: 'admin123'

        $admin = User::firstOrCreate(
            ['email' => $email],
            [
                'name' => 'Super Admin',
                'password' => Hash::make($passwordPlain),
            ]
        );

        // attach role admin via pivot (if exists + relation exists)
        $hasPivot =
            Schema::hasTable('user_roles') ||      // common
            Schema::hasTable('role_user') ||       // laravel default
            Schema::hasTable('user_role') ||       // alt
            Schema::hasTable('users_roles');       // alt

        $userHasRolesRel = method_exists(User::class, 'roles');

        if ($hasPivot && $userHasRolesRel) {
            $admin->roles()->syncWithoutDetaching([$adminRole->id]);
        }

        // optional legacy column users.role (if exists)
        if (Schema::hasColumn('users', 'role')) {
            // kalau UI lama masih baca users.role
            $admin->forceFill(['role' => 'ADMIN'])->save();
        }
    }
}
