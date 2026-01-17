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

        // ✅ Semua DONE
        if ($statuses->count() > 0 && $statuses->every(fn ($s) => $s === 'DONE')) {
            $story->update(['status' => 'DONE']);
            return;
        }

        // 🔄 Ada IN_PROGRESS
        if ($statuses->contains('IN_PROGRESS')) {
            $story->update(['status' => 'IN_PROGRESS']);
            return;
        }

        // 🧪 Semua minimal IN_REVIEW
        if ($statuses->every(fn ($s) => in_array($s, ['IN_REVIEW', 'DONE']))) {
            $story->update(['status' => 'IN_REVIEW']);
            return;
        }

        // 📝 Default
        $story->update(['status' => 'TODO']);
    }
}
