<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;


class PermissionMiddleware
{
    public function handle(Request $request, Closure $next, string $perm)
    {
        $user = $request->user();

        if (!$user || !$user->hasPermission($perm)) {
            return redirect()
                ->route('dashboard')
                ->with('alert', [
                    'type' => 'error',
                    'message' => "You don't have permission to access this page.",
                ]);
        }

        return $next($request);
    }
}
