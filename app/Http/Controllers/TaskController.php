<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Support\UniqueCode;
use App\Support\BoardAccess;

class TaskController extends Controller
{
    public function index(Request $request, Story $story)
    {
        $user = $request->user();

       $story->load(['epic.board', 'creator', 'epic.creator']);


        $board = $story->epic?->board;

        if (!$board) {
            return redirect()
                ->route('dashboard')
                ->with('alert', [
                    'type' => 'error',
                    'message' => 'Board not found for this story.',
                ]);
        }

        if (!BoardAccess::canAccess($user, $board)) {
            $msg = $user->role === 'PM'
                ? 'You are PM but not a member of this board yet.'
                : "You don't have access to this board.";

            return redirect()
                ->route('dashboard')
                ->with('alert', [
                    'type' => 'error',
                    'message' => $msg,
                ]);
        }

        $tasks = $story->tasks()
            ->with('creator')
            ->orderBy('position')
            ->get();

        return Inertia::render('Tasks/TaskBoard', [
            'board' => $board->only(['uuid', 'squad_code', 'title', 'created_at']),
            'story' => $story,
            'epic'  => $story->epic,
            'tasks' => $tasks,
        ]);
    }

    public function update(Request $request, Task $task)
    {
        $user = $request->user();

        // pastikan bisa resolve board dari task
        $task->load(['story.epic.board']);

        $board = $task->story?->epic?->board;

        if (!$board) {
            return redirect()
                ->route('dashboard')
                ->with('alert', [
                    'type' => 'error',
                    'message' => 'Board not found for this task.',
                ]);
        }

        if (!BoardAccess::canAccess($user, $board)) {
            return redirect()
                ->route('dashboard')
                ->with('alert', [
                    'type' => 'error',
                    'message' => "You don't have access to this board.",
                ]);
        }

        $to = $request->input('status');

        if (!in_array($user->role, ['PROGRAMMER', 'PM', 'SAD'], true)) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => "You don't have permission to update tasks.",
            ]);
        }

        // Programmer tidak boleh DONE
        if ($user->role === 'PROGRAMMER' && $to === 'DONE') {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Programmer cannot move task to DONE.',
            ]);
        }

        $task->update([
            'status' => $to,
            'position' => $request->input('position', $task->position),
        ]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Task updated.',
        ]);
    }

    public function store(Request $request, Story $story)
    {
        $user = $request->user();

        $story->load(['epic.board']);

        $board = $story->epic?->board;

        if (!$board) {
            return redirect()
                ->route('dashboard')
                ->with('alert', [
                    'type' => 'error',
                    'message' => 'Board not found for this story.',
                ]);
        }

        if (!BoardAccess::canAccess($user, $board)) {
            return redirect()
                ->route('dashboard')
                ->with('alert', [
                    'type' => 'error',
                    'message' => "You don't have access to this board.",
                ]);
        }

        if (!in_array($user->role, ['PM', 'SAD', 'PROGRAMMER'], true)) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => "You don't have permission to create tasks.",
            ]);
        }

        $validated = $request->validate([
            'priority' => ['required', 'in:LOW,MEDIUM,HIGH'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $position = $story->tasks()
            ->where('status', 'TODO')
            ->max('position');

        $story->tasks()->create([
            'uuid' => (string) Str::uuid(),
            'code' => UniqueCode::task(),
            'priority' => $validated['priority'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => 'TODO',
            'position' => ($position ?? -1) + 1,
            'assignee_id' => null,
            'created_by' => $user->id,
        ]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Task created.',
        ]);
    }
    public function destroy(Request $request, \App\Models\Task $task)
{
    abort_unless($request->user()?->hasPermission('update_task'), 403);

    $task->load('story.epic.board');

    $board = $task->story?->epic?->board;
    if ($board && !\App\Support\BoardAccess::canAccess($request->user(), $board)) {
        return back()->with('alert', [
            'type' => 'error',
            'message' => "You don't have access to this board.",
        ]);
    }

    $task->delete();

    return back()->with('alert', [
        'type' => 'success',
        'message' => 'Task deleted.',
    ]);
}

}
