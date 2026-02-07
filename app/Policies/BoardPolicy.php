<?php
namespace App\Policies;

use App\Models\Board;
use App\Models\User;

class BoardPolicy
{
  public function manageSettings(User $user, Board $board): bool
  {
    // 1) kalau ada permission system
    if (method_exists($user, 'hasPermission') && $user->hasPermission('manage_board_settings')) {
      return true;
    }

    // fallback: PM yang member board
    if ($user->role === 'PM') {
      return $board->members()->where('users.id', $user->id)->exists();
    }

    return false;
  }

  public function viewSettings(User $user, Board $board): bool
  {
    // minimal: semua member boleh view
    return $board->members()->where('users.id', $user->id)->exists();
  }
}
