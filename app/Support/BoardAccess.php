<?php

namespace App\Support;

use App\Models\Board;
use App\Models\User;

class BoardAccess
{
    /**
     * Kalau true: semua user wajib jadi member untuk akses board.
     * Kalau false: user dengan permission bypass boleh akses walau bukan member.
     */
    public static bool $mustBeMember = true;

    public static function canAccess(User $user, Board $board): bool
    {
        
        if (!self::$mustBeMember) {
            $canBypass = method_exists($user, 'hasPermission')
                ? ($user->hasPermission('boards.bypass_membership') || $user->hasPermission('manage_boards'))
                : false;

            if ($canBypass) {
                return true;
            }
        }

        // Default: membership-based
        return $board->members()
            ->where('users.id', $user->id)
            ->exists();
    }
}
