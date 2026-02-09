<?php

namespace App\Policies;

use App\Models\Board;
use App\Models\User;

class BoardPolicy
{
    public function manageSettings(User $user, Board $board): bool
    {
        // harus member + punya permission
        $isMember = $board->members()->where('users.id', $user->id)->exists();

        return $isMember && $user->hasPermission('manage_board_settings');
    }

    public function viewSettings(User $user, Board $board): bool
    {
        // semua member boleh view
        return $board->members()->where('users.id', $user->id)->exists();
    }
}
