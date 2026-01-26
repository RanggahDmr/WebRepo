<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Story $story)
    {
        $story->load(['epic.board', 'creator']);

        $tasks = $story->tasks()
            ->with('creator')
            ->orderBy('position')
            ->get();

        return Inertia::render('Tasks/TaskBoard', [
            'board' => $story->epic?->board?->only(['uuid', 'squad_code', 'title', 'created_at']),
            'story' => $story,
            'epic'  => $story->epic,
            'tasks' => $tasks,
        ]);
    }

    public function update(Request $request, Task $task)
    {
        logger('TASK UPDATE CONTROLLER HIT');

        $user = $request->user();
        $to = $request->status;

        if (!in_array($user->role, ['PROGRAMMER', 'PM', 'SAD'])) {
            abort(403);
        }

        // Programmer tidak boleh DONE
        if ($user->role === 'PROGRAMMER' && $to === 'DONE') {
            abort(403);
        }

        $task->update([
            'status' => $to,
            'position' => $request->position ?? $task->position,
        ]);

        return back();
    }

    public function store(Request $request, Story $story)
    {
        $user = $request->user();

        if (!in_array($user->role, ['PM', 'SAD', 'PROGRAMMER'])) {
            abort(403);
        }

        $validated = $request->validate([
            'priority' => 'required|in:LOW,MEDIUM,HIGH',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $position = $story->tasks()
            ->where('status', 'TODO')
            ->max('position');

        $story->tasks()->create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(),
            'code' => 'TS-' . strtoupper(\Illuminate\Support\Str::random(6)),
            'priority' => $validated['priority'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => 'TODO',
            'position' => ($position ?? -1) + 1,
            'assignee_id' => null,
            'created_by' => $user->id,
        ]);

        return back();
    }
}
