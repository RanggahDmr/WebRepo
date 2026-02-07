<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
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

        // attach role admin via pivot user_roles
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        // optional: kalau kamu masih punya kolom legacy users.role, isi biar gak bikin bingung UI lama
        // $admin->forceFill(['role' => 'ADMIN'])->save();
    }
}
