<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserRoleController extends Controller
{
    private function roles()
    {
        return Role::query()
            ->orderBy('name')
            ->get(['id', 'name', 'slug']);
    }

    private function pendingQuery()
    {
        return User::query()
            ->whereDoesntHave('roles')
            ->orderByDesc('created_at')
            ->get(['id', 'name', 'email', 'created_at']);
    }

    private function activeQuery()
    {
        return User::query()
            ->whereHas('roles')
            ->with(['roles:id,name,slug'])
            ->orderBy('name')
            ->get(['id', 'name', 'email']);
    }

    //  page Active Users
    public function active(Request $request)
    {
        abort_unless($request->user()?->hasPermission('manage_roles'), 403);

        return Inertia::render('Admin/Users/Active', [
            'roles' => $this->roles(),
            'users' => $this->activeQuery(),

            //  buat badge sidebar
            'pendingCount' => User::query()->whereDoesntHave('roles')->count(),
        ]);
    }

    //  page Pending Users
    public function pending(Request $request)
    {
        abort_unless($request->user()?->hasPermission('manage_roles'), 403);

        return Inertia::render('Admin/Users/Pending', [
            'roles' => $this->roles(),
            'pending' => $this->pendingQuery(),

            //  buat badge sidebar
            'pendingCount' => User::query()->whereDoesntHave('roles')->count(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        abort_unless($request->user()?->hasPermission('manage_roles'), 403);

        $data = $request->validate([
            'role_id' => ['required', 'integer', 'exists:roles,id'],
        ]);

        $user->roles()->sync([$data['role_id']]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Role updated.',
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        abort_unless($request->user()?->hasPermission('manage_roles'), 403);

        if ($user->id === $request->user()->id) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => "You can't delete your own account.",
            ]);
        }

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
