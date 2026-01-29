<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()?->hasPermission('manage_roles'), 403);

        $roles = Role::query()
            ->with(['permissions:id,name,key'])
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'created_at']);

        $permissions = Permission::query()
            ->orderBy('name')
            ->get(['id', 'name', 'key', 'description']);

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        abort_unless($request->user()?->hasPermission('manage_roles'), 403);

        $data = $request->validate([
            'name' => ['required','string','max:80'],
            'slug' => ['required','string','max:80', 'regex:/^[a-z0-9_]+$/', 'unique:roles,slug'],
            'description' => ['nullable','string','max:255'],
            'permissions' => ['nullable','array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role = Role::create([
            'name' => $data['name'],
            'slug' => $data['slug'],
            'description' => $data['description'] ?? null,
        ]);

        $role->permissions()->sync($data['permissions'] ?? []);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Role created.',
        ]);
    }

    public function update(Request $request, Role $role)
    {
        abort_unless($request->user()?->hasPermission('manage_roles'), 403);

        // optional safety: role admin slug jangan diubah
        $isAdmin = $role->slug === 'admin';

        $data = $request->validate([
            'name' => ['required','string','max:80'],
            'slug' => [
                Rule::requiredIf(!$isAdmin),
                'string','max:80','regex:/^[a-z0-9_]+$/',
                Rule::unique('roles','slug')->ignore($role->id),
            ],
            'description' => ['nullable','string','max:255'],
            'permissions' => ['nullable','array'],
            'permissions.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role->update([
            'name' => $data['name'],
            'slug' => $isAdmin ? $role->slug : ($data['slug'] ?? $role->slug),
            'description' => $data['description'] ?? null,
        ]);

        $role->permissions()->sync($data['permissions'] ?? []);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Role updated.',
        ]);
    }

    public function destroy(Request $request, Role $role)
    {
        abort_unless($request->user()?->hasPermission('manage_roles'), 403);

        if ($role->slug === 'admin') {
            return back()->with('alert', [
                'type' => 'error',
                'message' => "Admin role can't be deleted.",
            ]);
        }

        $role->delete();

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Role deleted.',
        ]);
    }
    public function syncPermissions(Request $request, Role $role)
{
    // kalau route sudah perm:manage_roles, ini optional
    abort_unless($request->user()?->hasPermission('manage_roles'), 403);

    $data = $request->validate([
        'permissions' => ['nullable','array'],
        'permissions.*' => ['integer','exists:permissions,id'],
    ]);

    $role->permissions()->sync($data['permissions'] ?? []);

    return back()->with('alert', [
        'type' => 'success',
        'message' => 'Permissions updated.',
    ]);
}

}
