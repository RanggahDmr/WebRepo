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
        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $request->user(),
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],

            // buat dropdown sidebar
         'navBoards' => fn () => $request->user()
    ? (
        $request->user()->role === 'PM'
            ? \App\Models\Board::query()->latest('updated_at')->get(['uuid','squad_code','title'])
            : \App\Models\Board::query()
                ->whereHas('members', fn ($q) => $q->where('users.id', $request->user()->id))
                ->latest('updated_at')
                ->get(['uuid','squad_code','title'])
      )
    : [],

        ]);
    }
}
