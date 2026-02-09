<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Seed RBAC + permissions + global masters
        $this->call([
            RbacSeeder::class,         // roles
            PermissionSeeder::class,   // permissions + role_permissions (include manage_global_*)
            GlobalMasterSeeder::class, // global_statuses/global_priorities/global_defaults
        ]);

        // 2) Pastikan role admin ada (sesuaikan slug kamu)
        // Saran: pakai slug 'admin' atau 'super_admin' — pilih yang kamu pakai di RbacSeeder
        $roleAdmin = Role::where('slug', 'super_admin')->first();

        if (!$roleAdmin) {
            $roleAdmin = Role::create([
                'slug' => 'super_admin',
                'name' => 'Super Admin',
            ]);
        }

        // 3) Seed user admin
        $adminEmail = 'admin@webrepo.test';
        $adminPassword = 'password';

        $admin = User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Super Admin',
                'password' => Hash::make($adminPassword),
            ]
        );

        // 4) Attach role ke user (pivot user_roles)
        DB::table('user_roles')->updateOrInsert(
            ['user_id' => $admin->id, 'role_id' => $roleAdmin->id],
            ['created_at' => now(), 'updated_at' => now()]
        );
    }
}
