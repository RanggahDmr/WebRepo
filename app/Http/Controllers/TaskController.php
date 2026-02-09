<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Support\UniqueCode;
use App\Support\BoardAccess;

class TaskController extends Controller
{
    /**
     * Ambil global defaults untuk scope tertentu
     */
    private function getGlobalDefaults(string $scope): array
    {
        $row = DB::table('global_defaults')
            ->where('scope', $scope)
            ->first(['default_status_id', 'default_priority_id']);

        return [
            'status_id' => $row?->default_status_id,
            'priority_id' => $row?->default_priority_id,
        ];
    }

    /**
     * Validasi status_id untuk scope tertentu
     */
    private function validateGlobalStatusId(string $scope, ?int $statusId): ?int
    {
        if (!$statusId) return null;

        $valid = DB::table('global_statuses')
            ->where('id', $statusId)
            ->where('scope', $scope)
            ->where('is_active', true)
            ->value('id');

        return $valid ?: null;
    }

    /**
     * Validasi priority_id untuk scope tertentu
     */
    private function validateGlobalPriorityId(string $scope, ?int $priorityId): ?int
    {
        if (!$priorityId) return null;

        $valid = DB::table('global_priorities')
            ->where('id', $priorityId)
            ->where('scope', $scope)
            ->where('is_active', true)
            ->value('id');

        return $valid ?: null;
    }

    /**
     * GET /stories/{story}/tasks
     * Render Task board / list
     */
    public function index(Request $request, Story $story)
    {
        $user = $request->user();

        // Load board untuk access check + summary FE
        $story->load([
            'epic.board',
            'creator:id,name',
            'epic.creator:id,name',

            // master relation (kalau sudah kamu define di model)
            'statusMaster:id,key,name,color,is_done',
            'priorityMaster:id,key,name,color',
        ]);

        $board = $story->epic?->board;

        if (!$board) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => 'Board not found for this story.',
            ]);
        }

        if (!BoardAccess::canAccess($user, $board)) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => "You don't have access to this board.",
            ]);
        }

        // Global master options for TASK
        $taskStatuses = DB::table('global_statuses')
            ->where('scope', 'TASK')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'key', 'name', 'color', 'is_done', 'is_active']);

        $taskPriorities = DB::table('global_priorities')
            ->where('scope', 'TASK')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'key', 'name', 'color', 'is_active']);

        // Tasks list
        $tasks = $story->tasks()
            ->with([
                'creator:id,name',
                'assignee:id,name', // users.role sudah di-drop
                'statusMaster:id,key,name,color,is_done',
                'priorityMaster:id,key,name,color',
            ])
            ->orderBy('position')
            ->get();

        return Inertia::render('Tasks/TaskBoard', [
            'board' => $board->only(['uuid', 'title', 'created_at']),

            'epic' => $story->epic ? [
                'uuid' => $story->epic->uuid,
                'code' => $story->epic->code ?? null,
                'title' => $story->epic->title ?? null,
                'creator' => $story->epic->creator?->only(['id', 'name']),
            ] : null,

            'story' => [
                ...$story->only([
                    'uuid',
                    'epic_uuid',
                    'code',
                    'title',
                    'description',
                    'priority_id',
                    'status_id',
                    'created_by',
                    'created_at',
                    'updated_at',
                ]),
                'creator' => $story->creator?->only(['id', 'name']),
                'statusMaster' => $story->statusMaster
                    ? $story->statusMaster->only(['id', 'key', 'name', 'color', 'is_done'])
                    : null,
                'priorityMaster' => $story->priorityMaster
                    ? $story->priorityMaster->only(['id', 'key', 'name', 'color'])
                    : null,
                'epic' => $story->epic ? [
                    'uuid' => $story->epic->uuid,
                    'creator' => $story->epic->creator?->only(['id', 'name']),
                ] : null,
            ],

            'tasks' => $tasks,
            'taskStatuses' => $taskStatuses,
            'taskPriorities' => $taskPriorities,
        ]);
    }

    /**
     * POST /stories/{story}/tasks
     * Create new task with global defaults (TASK scope)
     */
    public function store(Request $request, Story $story)
    {
        $user = $request->user();

        $story->load(['epic.board']);
        $board = $story->epic?->board;

        if (!$board) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => 'Board not found for this story.',
            ]);
        }

        if (!BoardAccess::canAccess($user, $board)) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => "You don't have access to this board.",
            ]);
        }

        if (!method_exists($user, 'hasPermission') || !$user->hasPermission('create_task')) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => "You don't have permission to create tasks.",
            ]);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

            // optional override
            'status_id' => ['nullable', 'integer'],
            'priority_id' => ['nullable', 'integer'],

            'assignee_id' => ['nullable', 'integer'],
        ]);

        $defaults = $this->getGlobalDefaults('TASK');

        $statusId = $this->validateGlobalStatusId('TASK', $validated['status_id'] ?? null)
            ?: $defaults['status_id'];

        $priorityId = $this->validateGlobalPriorityId('TASK', $validated['priority_id'] ?? null)
            ?: $defaults['priority_id'];

        if (!$statusId || !$priorityId) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Global defaults for TASK are not configured yet.',
            ]);
        }

        // Next position in story (simple)
        $nextPos = (int) ($story->tasks()->max('position') ?? -1) + 1;

        $story->tasks()->create([
            'uuid' => (string) Str::uuid(),
            'code' => UniqueCode::task(),

            'status_id' => $statusId,
            'priority_id' => $priorityId,

            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,

            'position' => $nextPos,
            'assignee_id' => $validated['assignee_id'] ?? null,
            'created_by' => $user->id,
        ]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Task created.',
        ]);
    }

    /**
     * PATCH /tasks/{task}
     * Update task (status_id/priority_id validated to TASK scope)
     */
    public function update(Request $request, Task $task)
    {
        $user = $request->user();

        $task->load(['story.epic.board']);
        $board = $task->story?->epic?->board;

        if (!$board) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => 'Board not found for this task.',
            ]);
        }

        if (!BoardAccess::canAccess($user, $board)) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => "You don't have access to this board.",
            ]);
        }

        if (!method_exists($user, 'hasPermission') || !$user->hasPermission('update_task')) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => "You don't have permission to update tasks.",
            ]);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'position' => ['sometimes', 'nullable', 'integer'],
            'assignee_id' => ['sometimes', 'nullable', 'integer'],

            'status_id' => ['sometimes', 'nullable', 'integer'],
            'priority_id' => ['sometimes', 'nullable', 'integer'],
        ]);

        if (empty($validated)) return back();

        // Validate status_id if provided
        if (array_key_exists('status_id', $validated)) {
            $newStatusId = $this->validateGlobalStatusId('TASK', $validated['status_id']);
            if (!$newStatusId) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => 'Invalid status for TASK scope.',
                ]);
            }
            $validated['status_id'] = $newStatusId;
        }

        // Validate priority_id if provided
        if (array_key_exists('priority_id', $validated)) {
            $newPriorityId = $this->validateGlobalPriorityId('TASK', $validated['priority_id']);
            if (!$newPriorityId) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => 'Invalid priority for TASK scope.',
                ]);
            }
            $validated['priority_id'] = $newPriorityId;
        }

        $task->update($validated);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Task updated.',
        ]);
    }

    /**
     * DELETE /tasks/{task}
     */
    public function destroy(Request $request, Task $task)
    {
        abort_unless($request->user()?->hasPermission('delete_task'), 403);

        $task->load('story.epic.board');
        $board = $task->story?->epic?->board;

        if ($board && !BoardAccess::canAccess($request->user(), $board)) {
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
