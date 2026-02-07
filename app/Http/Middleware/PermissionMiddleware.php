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
            $message = "You don't have permission to access this page.";

            // ambil previous URL (referer)
            $previous = url()->previous();
            $current  = $request->fullUrl();

            // fallback kalau direct access tanpa referer atau referer sama dengan current (hindari loop)
            $fallback = route('monitoring.index'); // ganti sesuai route monitoring kamu
            $target = (!$previous || $previous === $current) ? $fallback : $previous;

            return redirect()
                ->to($target)
                ->with('alert', [
                    'type' => 'error',
                    'message' => $message,
                ]);
        }

        return $next($request);
    }
}
