<?php

namespace App\Policies;

use App\Models\User;
use App\Models\GlobalPriority;

class GlobalPriorityPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, GlobalPriority $globalPriority): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('manage_global_priorities');
    }

    public function update(User $user, GlobalPriority $globalPriority): bool
    {
        return $user->hasPermission('manage_global_priorities');
    }

    // delete = deactivate (opsi A)
    public function delete(User $user, GlobalPriority $globalPriority): bool
    {
        return $user->hasPermission('manage_global_priorities');
    }
}
