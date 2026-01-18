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
        $story->load('epic');

        return Inertia::render('Tasks/TaskBoard', [
            'story' => $story,
            'epic' => $story->epic,
             'tasks' => $story->tasks()->orderBy('position')->get(),
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

    if (!in_array($user->role, ['PM', 'SAD'])) {
        abort(403);
    }

    $validated = $request->validate([
        'type' => 'required|in:FE,BE,QA',
        'title' => 'required|string|max:255',
        'description' => 'nullable|string',
    ]);

    $position = $story->tasks()
        ->where('status', 'TODO')
        ->max('position');

    $task = $story->tasks()->create([
        'type' => $validated['type'],
        'title' => $validated['title'],
        'description' => $validated['description'] ?? null,
        'status' => 'TODO',
        'position' => ($position ?? -1) + 1,
        'assignee_id' => null,
    ]);

    return back();
}

}
