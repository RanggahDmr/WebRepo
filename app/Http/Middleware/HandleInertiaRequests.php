<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = $request->user();

        // roles columns safety (some projects don't have roles.name)
        $roleCols = ['roles.id', 'roles.slug'];
        if (Schema::hasColumn('roles', 'name')) {
            $roleCols[] = 'roles.name';
        }

        $roles = collect();
        $permissions = collect();

        if ($user) {
            // load roles + permissions (id,key) once
            $roles = $user->roles()
                ->select($roleCols)
                ->with(['permissions:id,key'])
                ->get();

            $permissions = $roles
                ->flatMap(fn ($r) => $r->permissions->pluck('key'))
                ->unique()
                ->values();
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user
                    ? $user->only(['id', 'name', 'email']) + [
                        'roles' => $roles,
                        'permissions' => $permissions,
                    ]
                    : null,
            ],

            'flash' => [
                'alert' => fn () => $request->session()->get('alert'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            'navBoards' => fn () => $user
                ? \App\Models\Board::query()
                    ->whereHas('members', fn ($q) => $q->where('users.id', $user->id))
                    ->latest('updated_at')
                    ->get(['uuid', 'title'])
                : [],
        ]);
    }
}
