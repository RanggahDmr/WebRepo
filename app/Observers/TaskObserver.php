<?php

namespace App\Observers;

use App\Models\Task;

class TaskObserver
{
    public function saved(Task $task): void
    {
        $story = $task->story;

        if (!$story) {
            return;
        }

        $statuses = $story->tasks()->pluck('status');

        
        if ($statuses->count() > 0 && $statuses->every(fn ($s) => $s === 'DONE')) {
            $story->update(['status' => 'DONE']);
            return;
        }

      
        if ($statuses->contains('IN_PROGRESS')) {
            $story->update(['status' => 'IN_PROGRESS']);
            return;
        }

       
        if ($statuses->every(fn ($s) => in_array($s, ['IN_REVIEW', 'DONE']))) {
            $story->update(['status' => 'IN_REVIEW']);
            return;
        }

       
        $story->update(['status' => 'TODO']);
    }
    
     public function created(Task $task): void
    {
        log_activity($task, 'created', [
            'after' => $task->only(['title', 'status', 'type']),
        ]);
    }

    public function updated(Task $task): void
    {
        if ($task->wasChanged('status')) {
            log_activity($task, 'status_changed', [
                'from' => $task->getOriginal('status'),
                'to' => $task->status,
            ]);
        }
    }

    public function deleted(Task $task): void
    {
        log_activity($task, 'deleted', [
            'before' => $task->only(['title', 'status']),
        ]);
    }
}
