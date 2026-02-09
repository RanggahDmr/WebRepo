<?php

namespace App\Policies;

use App\Models\User;
use App\Models\GlobalStatus;

class GlobalStatusPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, GlobalStatus $globalStatus): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('manage_global_statuses');
    }

    public function update(User $user, GlobalStatus $globalStatus): bool
    {
        return $user->hasPermission('manage_global_statuses');
    }

    // delete = deactivate (opsi A)
    public function delete(User $user, GlobalStatus $globalStatus): bool
    {
        return $user->hasPermission('manage_global_statuses');
    }
}
