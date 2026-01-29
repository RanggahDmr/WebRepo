<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserRoleController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()?->hasPermission('manage_roles'), 403);

        $roles = Role::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);

        // pending = user tanpa role
        $pending = User::query()
            ->whereDoesntHave('roles')
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'email', 'created_at']);

        // active = user punya role
        $users = User::query()
            ->whereHas('roles')
            ->with(['roles:id,name,slug'])
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Admin/Users', [
            'roles' => $roles,
            'pending' => $pending,
            'users' => $users,
        ]);
    }

    public function update(Request $request, User $user)
    {
        abort_unless($request->user()?->hasPermission('manage_roles'), 403);

        $data = $request->validate([
            'role_id' => ['required', 'integer', 'exists:roles,id'],
        ]);

        // kalau kamu mau user cuma 1 role:
        $user->roles()->sync([$data['role_id']]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Role updated.',
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        abort_unless($request->user()?->hasPermission('manage_roles'), 403);

        // safety: jangan delete diri sendiri
        if ($user->id === $request->user()->id) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => "You can't delete your own account.",
            ]);
        }

        // safety: jangan delete admin terakhir (optional)
        $adminRoleId = Role::query()->where('slug', 'admin')->value('id');
        if ($adminRoleId) {
            $adminCount = User::query()
                ->whereHas('roles', fn ($q) => $q->where('roles.id', $adminRoleId))
                ->count();

            $isAdmin = $user->roles()->where('roles.id', $adminRoleId)->exists();

            if ($isAdmin && $adminCount <= 1) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => "You can't delete the last admin.",
                ]);
            }
        }

        $user->delete();

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'User deleted.',
        ]);
    }
}
