<?php

namespace App\Observers;

use App\Models\Epic;

class EpicObserver
{
    public function created(Epic $epic): void
    {
        log_activity($epic, 'created', [
            'after' => $epic->only(['title', 'status']),
        ]);
    }

    public function updated(Epic $epic): void
    {
        if ($epic->wasChanged('status')) {
            log_activity($epic, 'status_changed', [
                'from' => $epic->getOriginal('status'),
                'to' => $epic->status,
            ]);
        }
    }
}
