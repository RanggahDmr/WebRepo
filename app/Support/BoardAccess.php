<?php

namespace App\Support;

use App\Models\Board;
use App\Models\User;

class BoardAccess
{
    // PM juga wajib member? true/false
    public static bool $pmMustBeMember = true;

    public static function canAccess(User $user, Board $board): bool
    {
        if ($user->role === 'PM' && !self::$pmMustBeMember) {
            return true;
        }

        return $board->members()->where('users.id', $user->id)->exists();
    }
}
