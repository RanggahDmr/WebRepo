<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
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

    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $user ? $user->only(['id','name','email']) + [
                // kirim roles & permissions keys supaya FE bisa hide/show menu
                'roles' => $user->roles()->get(['roles.id','roles.name','roles.slug']),

                'permissions' => $user->roles()
    ->with('permissions:permissions.id,permissions.key')
    ->get()
    ->flatMap(fn ($r) => $r->permissions->pluck('key'))
    ->unique()
    ->values(),

            ] : null,
        ],

        'flash' => [
            'alert' => session('alert'),
            'success' => fn () => $request->session()->get('success'),
            'error'   => fn () => $request->session()->get('error'),
        ],

        // dropdown sidebar
        'navBoards' => fn () => $user
            ? (
                // kalau punya permission manage_boards => boleh lihat semua board
                $user->hasPermission('manage_boards')
                    ? \App\Models\Board::query()
                        ->latest('updated_at')
                        ->get(['uuid','squad_code','title'])
                    : \App\Models\Board::query()
                        ->whereHas('members', fn ($q) => $q->where('users.id', $user->id))
                        ->latest('updated_at')
                        ->get(['uuid','squad_code','title'])
            )
            : [],
    ]);
}

}
