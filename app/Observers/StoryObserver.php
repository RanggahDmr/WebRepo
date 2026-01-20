<?php

namespace App\Observers;

use App\Models\Story;

class StoryObserver
{
    public function saved(Story $story): void
    {
        $epic = $story->epic;

        if (!$epic) {
            return;
        }

        $statuses = $epic->stories()->pluck('status');

    
        if ($statuses->count() > 0 && $statuses->every(fn ($s) => $s === 'DONE')) {
            $epic->update(['status' => 'DONE']);
            return;
        }

     
        if ($statuses->contains('IN_PROGRESS')) {
            $epic->update(['status' => 'IN_PROGRESS']);
            return;
        }

      
        if ($statuses->every(fn ($s) => in_array($s, ['IN_REVIEW', 'DONE']))) {
            $epic->update(['status' => 'IN_REVIEW']);
            return;
        }

       
        $epic->update(['status' => 'TODO']);
    }

     public function created(Story $story): void
    {
        log_activity($story, 'created', [
            'after' => $story->only(['title', 'status']),
        ]);
    }

    public function updated(Story $story): void
    {
        if ($story->wasChanged('status')) {
            log_activity($story, 'status_changed', [
                'from' => $story->getOriginal('status'),
                'to' => $story->status,
            ]);
        }
    }
}
