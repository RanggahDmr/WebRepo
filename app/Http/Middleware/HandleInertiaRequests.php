<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;
use App\Models\Board;

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

    $roleCols = ['roles.id', 'roles.slug'];
    if (Schema::hasColumn('roles', 'name')) {
        $roleCols[] = 'roles.name';
    }

    $roles = $user
        ? $user->roles()->with('permissions:id,key')->get($roleCols)
        : collect();

    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $user
                ? $user->only(['id', 'name', 'email']) + [
                    'roles' => $roles,
                    'permissions' => $roles
                        ->flatMap(fn ($r) => $r->permissions->pluck('key'))
                        ->unique()
                        ->values(),
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
                ->get(['uuid', 'squad_code', 'title'])
            : [],
    ]);
    
}



}
