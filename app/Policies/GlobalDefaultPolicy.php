<?php

namespace App\Policies;

use App\Models\User;
use App\Models\GlobalDefault;

class GlobalDefaultPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, GlobalDefault $globalDefault): bool
    {
        return true;
    }

    public function update(User $user, GlobalDefault $globalDefault): bool
    {
        return $user->hasPermission('manage_global_defaults');
    }
}
