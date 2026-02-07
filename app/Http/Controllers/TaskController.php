<?php

namespace App\Http\Controllers;

use App\Models\Story;
use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Support\UniqueCode;
use App\Support\BoardAccess;
use App\Models\BoardStatus;
use App\Models\BoardPriority;
use App\Services\BoardMasterResolver;

class TaskController extends Controller
{
  public function index(Request $request, Story $story)
{
    $user = $request->user();

    // load relations needed for summary + permissions
    $story->load([
        'epic.board',
        'creator:id,name',
        'epic.creator:id,name',
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

    $taskStatuses = BoardStatus::query()
        ->where('board_uuid', $board->uuid)
        ->where('scope', 'TASK')
        ->where('is_active', true)
        ->orderBy('position')
        ->get(['id', 'key', 'name', 'color', 'is_done', 'is_default']);

    $taskPriorities = BoardPriority::query()
        ->where('board_uuid', $board->uuid)
        ->where('scope', 'TASK')
        ->where('is_active', true)
        ->orderBy('position')
        ->get(['id', 'key', 'name', 'color', 'is_default']);

    $tasks = $story->tasks()
        ->with([
            'creator:id,name',
            'assignee:id,name,role',
            'statusMaster:id,key,name,color,is_done',
            'priorityMaster:id,key,name,color',
        ])
        ->orderBy('position')
        ->get();

    return Inertia::render('Tasks/TaskBoard', [
        'board' => $board->only(['uuid', 'squad_code', 'title', 'created_at']),

        // keep epic top-level in case TaskBoard.tsx still expects it
        'epic' => $story->epic ? [
            'uuid' => $story->epic->uuid,
            'code' => $story->epic->code ?? null,
            'title' => $story->epic->title ?? null,
            'creator' => $story->epic->creator?->only(['id', 'name']),
        ] : null,

        // explicit story for consistent FE fields
        'story' => [
            ...$story->only([
                'uuid',
                'epic_uuid',
                'code',
                'title',
                'description',
                'priority',
                'status',
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

            // also include epic nested so StorySummary can read story.epic.creator safely
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


    public function store(Request $request, Story $story, BoardMasterResolver $resolver)
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

        //  RBAC (no hardcode role)
        if (!method_exists($user, 'hasPermission') || !$user->hasPermission('create_task')) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => "You don't have permission to create tasks.",
            ]);
        }

        $validated = $request->validate([
            'priority_id' => ['required', 'integer'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status_id' => ['nullable', 'integer'],
        ]);

        $priorityId = BoardPriority::query()
            ->where('id', $validated['priority_id'])
            ->where('board_uuid', $board->uuid)
            ->where('scope', 'TASK')
            ->where('is_active', true)
            ->value('id');

        if (!$priorityId) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Invalid priority for this board.',
            ]);
        }

        $statusId = null;

        if (!empty($validated['status_id'])) {
            $statusId = BoardStatus::query()
                ->where('id', $validated['status_id'])
                ->where('board_uuid', $board->uuid)
                ->where('scope', 'TASK')
                ->where('is_active', true)
                ->value('id');

            if (!$statusId) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => 'Invalid status for this board.',
                ]);
            }
        }

        if (!$statusId) {
            $statusId = BoardStatus::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', 'TASK')
                ->where('is_default', true)
                ->where('is_active', true)
                ->value('id');
        }

        if (!$statusId) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'No default TASK status configured for this board.',
            ]);
        }

        $position = $story->tasks()
            ->where('status_id', $statusId)
            ->max('position');

        $priorityKey = BoardPriority::where('id', $priorityId)->value('key');
        $statusKey = BoardStatus::where('id', $statusId)->value('key');

        $legacyPriorityMap = [
            'low' => 'LOW',
            'medium' => 'MEDIUM',
            'high' => 'HIGH',
        ];

        $legacyStatusMap = [
            'backlog' => 'TODO',
            'in_progress' => 'IN_PROGRESS',
            'in_review' => 'IN_REVIEW',
            'done' => 'DONE',
        ];

        $story->tasks()->create([
            'uuid' => (string) Str::uuid(),
            'code' => UniqueCode::task(),

            'priority_id' => $priorityId,
            'status_id' => $statusId,

            // legacy
            'priority' => $legacyPriorityMap[$priorityKey] ?? 'MEDIUM',
            'status' => $legacyStatusMap[$statusKey] ?? 'TODO',

            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,

            'position' => ($position ?? -1) + 1,
            'assignee_id' => null,
            'created_by' => $user->id,
        ]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Task created.',
        ]);
    }

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
        'status_id' => ['sometimes', 'nullable', 'integer'],
        'priority_id' => ['sometimes', 'nullable', 'integer'],
        'status' => ['sometimes', 'nullable', 'string'],
        'priority' => ['sometimes', 'nullable', 'string'],
        'position' => ['sometimes', 'nullable', 'integer'],
        'title' => ['sometimes', 'string', 'max:255'],
        'description' => ['sometimes', 'nullable', 'string'],
    ]);

    if (empty($validated)) return back();

    $wantsStatus =
        array_key_exists('status_id', $validated) ||
        array_key_exists('status', $validated);

    $wantsPriority =
        array_key_exists('priority_id', $validated) ||
        array_key_exists('priority', $validated);

    // ========= RESOLVE STATUS (only if requested) =========
    if ($wantsStatus) {
        $targetStatus = null;

        if (!empty($validated['status_id'])) {
            $targetStatus = BoardStatus::query()
                ->where('id', $validated['status_id'])
                ->where('board_uuid', $board->uuid)
                ->where('scope', 'TASK')
                ->where('is_active', true)
                ->first();
        }

        if (!$targetStatus && !empty($validated['status'])) {
            $map = [
                'TODO' => 'backlog',
                'BACKLOG' => 'backlog',
                'IN_PROGRESS' => 'in_progress',
                'IN_REVIEW' => 'in_review',
                'DONE' => 'done',
            ];

            $legacy = strtoupper(trim($validated['status']));
            $key = $map[$legacy] ?? null;

            if ($key) {
                $targetStatus = BoardStatus::query()
                    ->where('board_uuid', $board->uuid)
                    ->where('scope', 'TASK')
                    ->where('key', $key)
                    ->where('is_active', true)
                    ->first();
            }
        }

        if (!$targetStatus) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Invalid target status.',
            ]);
        }

        $legacyStatusString = match ($targetStatus->key) {
            'backlog' => 'TODO',
            'in_progress' => 'IN_PROGRESS',
            'in_review' => 'IN_REVIEW',
            'done' => 'DONE',
            default => strtoupper($targetStatus->name),
        };

        $validated['status_id'] = $targetStatus->id;
        $validated['status'] = $legacyStatusString;
    }

    // ========= RESOLVE PRIORITY (only if requested) =========
    if ($wantsPriority) {
        $targetPriority = null;

        if (!empty($validated['priority_id'])) {
            $targetPriority = BoardPriority::query()
                ->where('id', $validated['priority_id'])
                ->where('board_uuid', $board->uuid)
                ->where('scope', 'TASK')
                ->where('is_active', true)
                ->first();
        }

        if (!$targetPriority && !empty($validated['priority'])) {
            $map = [
                'LOW' => 'low',
                'MEDIUM' => 'medium',
                'HIGH' => 'high',
            ];

            $legacy = strtoupper(trim($validated['priority']));
            $key = $map[$legacy] ?? null;

            if ($key) {
                $targetPriority = BoardPriority::query()
                    ->where('board_uuid', $board->uuid)
                    ->where('scope', 'TASK')
                    ->where('key', $key)
                    ->where('is_active', true)
                    ->first();
            }
        }

        if (!$targetPriority) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Invalid target priority.',
            ]);
        }

        $legacyPriorityString = match ($targetPriority->key) {
            'low' => 'LOW',
            'medium' => 'MEDIUM',
            'high' => 'HIGH',
            default => strtoupper($targetPriority->name),
        };

        $validated['priority_id'] = $targetPriority->id;
        $validated['priority'] = $legacyPriorityString;
    }

    // ========= UPDATE (only fields that passed validation) =========
    $payload = [];

    foreach ([
        'title', 'description',
        'status_id', 'status',
        'priority_id', 'priority',
        'position',
    ] as $k) {
        if (array_key_exists($k, $validated)) $payload[$k] = $validated[$k];
    }

    if (empty($payload)) return back();

    $task->update($payload);

    return back()->with('alert', [
        'type' => 'success',
        'message' => 'Task updated.',
    ]);
}


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
    public function getRouteKeyName()
{
    return 'uuid';
}

}
