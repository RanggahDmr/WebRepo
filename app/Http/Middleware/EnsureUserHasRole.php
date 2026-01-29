<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // ✅ RBAC: user harus punya minimal 1 role (di pivot user_roles)
        $hasAnyRole = $user->roles()->exists();

        if (!$hasAnyRole) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('login')
                ->with('alert', [
                    'type' => 'error',
                    'message' => 'Akun kamu belum di-assign role oleh PM/Admin. Hubungi admin untuk aktivasi.',
                ]);
        }

        return $next($request);
    }
}
