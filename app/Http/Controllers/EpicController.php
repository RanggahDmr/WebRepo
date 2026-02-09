<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Epic;
use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Support\UniqueCode;

class EpicController extends Controller
{
    /**
     * Helper: pastikan user member board
     */
    private function ensureBoardMember(Request $request, Board $board)
    {
        $user = $request->user();

        $isMember = $board->members()
            ->where('users.id', $user->id)
            ->exists();

        if ($isMember) return null;

        $message = "You don't have access to this board.";

        if ($request->header('X-Inertia')) {
            abort(403, $message);
        }

        return redirect()
            ->route('dashboard')
            ->with('alert', [
                'type' => 'error',
                'message' => $message,
            ]);
    }

    /**
     * Global masters untuk scope tertentu (EPIC/STORY/TASK)
     */
    private function getMasters(string $scope): array
    {
        $statuses = DB::table('global_statuses')
            ->where('scope', $scope)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'key', 'name', 'color', 'sort_order', 'is_done', 'is_active'])
            ->values()
            ->all();

        $priorities = DB::table('global_priorities')
            ->where('scope', $scope)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'key', 'name', 'color', 'sort_order', 'is_active'])
            ->values()
            ->all();

        return [$statuses, $priorities];
    }

    /**
     * Default global untuk scope tertentu
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
     * LIST EPICS PER BOARD
     * GET /boards/{board}/epics
     */
    public function index(Request $request, Board $board)
    {
        if ($resp = $this->ensureBoardMember($request, $board)) return $resp;

        [$epicStatuses, $epicPriorities] = $this->getMasters('EPIC');

        $epics = Epic::query()
            ->where('board_uuid', $board->uuid)
            ->with([
                'creator:id,name',
                'statusMaster:id,key,name,color,is_done',
                'priorityMaster:id,key,name,color',
            ])
            ->latest('updated_at')
            ->get([
                'uuid',
                'board_uuid',
                'code',
                'title',
                'description',
                'priority_id',
                'status_id',
                'created_by',
                'created_at',
                'updated_at',
            ]);

        return Inertia::render('Dashboard/Index', [
            'board' => $board->only(['uuid', 'title', 'created_at']),
            'epics' => $epics,
            'epicStatuses' => $epicStatuses,
            'epicPriorities' => $epicPriorities,
        ]);
    }

    /**
     * SHOW EPIC + STORIES
     * GET /epics/{epic}
     */
    public function show(Request $request, Epic $epic)
    {
        $epic = Epic::query()
            ->where('uuid', $epic->uuid)
            ->with([
                'board',
                'creator:id,name',
                'statusMaster:id,key,name,color,is_done',
                'priorityMaster:id,key,name,color',
            ])
            ->firstOrFail();

        $board = $epic->board;

        if (!$board) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => 'Board not found for this epic.',
            ]);
        }

        if ($resp = $this->ensureBoardMember($request, $board)) return $resp;

        [$storyStatuses, $storyPriorities] = $this->getMasters('STORY');

        $stories = Story::query()
            ->where('epic_uuid', $epic->uuid)
            ->with([
                'creator:id,name',
                'statusMaster:id,key,name,color,is_done',
                'priorityMaster:id,key,name,color',
            ])
            ->latest('updated_at')
            ->get([
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
            ]);

        return Inertia::render('Epics/Show', [
            'board' => $board->only(['uuid', 'title', 'created_at']),
            'epic' => [
                ...$epic->only([
                    'uuid', 'board_uuid', 'code', 'title', 'description',
                    'priority_id', 'status_id',
                    'created_by', 'created_at', 'updated_at',
                ]),
                'creator' => $epic->creator?->only(['id', 'name']),
                'priorityMaster' => $epic->priorityMaster
                    ? $epic->priorityMaster->only(['id', 'key', 'name', 'color'])
                    : null,
                'statusMaster' => $epic->statusMaster
                    ? $epic->statusMaster->only(['id', 'key', 'name', 'color', 'is_done'])
                    : null,
            ],
            'stories' => $stories,
            'storyStatuses' => $storyStatuses,
            'storyPriorities' => $storyPriorities,
        ]);
    }

    /**
     * CREATE EPIC
     * POST /boards/{board}/epics
     */
    public function store(Request $request, Board $board)
    {
        if ($resp = $this->ensureBoardMember($request, $board)) return $resp;

        abort_unless($request->user()?->hasPermission('create_epic'), 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status_id' => ['nullable', 'integer'],
            'priority_id' => ['nullable', 'integer'],
        ]);

        $defaults = $this->getGlobalDefaults('EPIC');

        $statusId = $this->validateGlobalStatusId('EPIC', $validated['status_id'] ?? null)
            ?: $defaults['status_id'];

        $priorityId = $this->validateGlobalPriorityId('EPIC', $validated['priority_id'] ?? null)
            ?: $defaults['priority_id'];

        if (!$statusId || !$priorityId) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Global defaults for EPIC are not configured yet.',
            ]);
        }

        Epic::create([
            'uuid' => (string) Str::uuid(),
            'board_uuid' => $board->uuid,
            'code' => UniqueCode::epic(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status_id' => $statusId,
            'priority_id' => $priorityId,
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('epics.index', $board)->with('alert', [
            'type' => 'success',
            'message' => 'Epic created.',
        ]);
    }

    /**
     * UPDATE EPIC
     * PATCH /epics/{epic}
     */
    public function update(Request $request, Epic $epic)
    {
        $epic->load('board');
        $board = $epic->board;

        if (!$board) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => 'Board not found for this epic.',
            ]);
        }

        if ($resp = $this->ensureBoardMember($request, $board)) return $resp;

        abort_unless($request->user()?->hasPermission('update_epic'), 403);

        $validated = $request->validate([
            'code' => ['sometimes', 'nullable', 'string', 'max:30', 'unique:epics,code,' . $epic->uuid . ',uuid'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status_id' => ['sometimes', 'nullable', 'integer'],
            'priority_id' => ['sometimes', 'nullable', 'integer'],
        ]);

        if (empty($validated)) return back();

        if (array_key_exists('status_id', $validated)) {
            $newStatusId = $this->validateGlobalStatusId('EPIC', $validated['status_id']);
            if (!$newStatusId) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => 'Invalid status for EPIC scope.',
                ]);
            }
            $validated['status_id'] = $newStatusId;
        }

        if (array_key_exists('priority_id', $validated)) {
            $newPriorityId = $this->validateGlobalPriorityId('EPIC', $validated['priority_id']);
            if (!$newPriorityId) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => 'Invalid priority for EPIC scope.',
                ]);
            }
            $validated['priority_id'] = $newPriorityId;
        }

        $epic->update($validated);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Epic updated.',
        ]);
    }

    /**
     * DELETE EPIC
     * DELETE /epics/{epic}
     */
    public function destroy(Request $request, Epic $epic)
    {
        $epic->load('board');
        $board = $epic->board;

        if ($board && ($resp = $this->ensureBoardMember($request, $board))) return $resp;

        abort_unless($request->user()?->hasPermission('deleted_epic'), 403);

        $epic->delete();

        return redirect()->route('epics.index', $board)->with('alert', [
            'type' => 'success',
            'message' => 'Epic deleted.',
        ]);
    }
}
