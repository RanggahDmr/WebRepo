<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Epic;
use App\Models\Story;
use App\Models\BoardStatus;
use App\Models\BoardPriority;
use App\Models\GlobalStatus;
use App\Models\GlobalDefault;
use App\Models\GlobalPriority;

use Illuminate\Support\Facades\Log;

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
   private function getGlobalDefaultKeys(string $scope): array
{
    $row = DB::table('global_defaults')
        ->where('scope', $scope)
        ->first(['default_status_id', 'default_priority_id']);

    if (!$row?->default_status_id || !$row?->default_priority_id) {
        return ['status_key' => null, 'priority_key' => null];
    }

    $statusKey = DB::table('global_statuses')
        ->where('id', $row->default_status_id)
        ->value('key');

    $priorityKey = DB::table('global_priorities')
        ->where('id', $row->default_priority_id)
        ->value('key');

    return [
        'status_key' => $statusKey,
        'priority_key' => $priorityKey,
    ];
}

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

        // ✅ ini BOARD ids (karena FK epics -> board_statuses / board_priorities)
        'status_id' => ['nullable', 'integer'],
        'priority_id' => ['nullable', 'integer'],
    ]);

    // 1) kalau user pilih manual, anggap itu BOARD master id
    $pickedBoardStatusId = $this->validateBoardStatusId($board->uuid, 'EPIC', $validated['status_id'] ?? null);
    $pickedBoardPriorityId = $this->validateBoardPriorityId($board->uuid, 'EPIC', $validated['priority_id'] ?? null);

    // 2) fallback ke global defaults → map ke board master by key
    if (!$pickedBoardStatusId || !$pickedBoardPriorityId) {
        $defaults = GlobalDefault::query()->where('scope', 'EPIC')->first();

        if (!$defaults || !$defaults->default_status_id || !$defaults->default_priority_id) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Global defaults for EPIC are not configured yet.',
            ]);
        }

        $globalStatus = GlobalStatus::find($defaults->default_status_id);
        $globalPriority = GlobalPriority::find($defaults->default_priority_id);

        if (!$globalStatus || !$globalPriority) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Global defaults are invalid. Please reconfigure defaults.',
            ]);
        }

        // map global key -> board master record
        $pickedBoardStatusId = $pickedBoardStatusId ?: $this->mapGlobalStatusToBoardStatusId(
            $board->uuid,
            'EPIC',
            $globalStatus->key
        );

        $pickedBoardPriorityId = $pickedBoardPriorityId ?: $this->mapGlobalPriorityToBoardPriorityId(
            $board->uuid,
            'EPIC',
            $globalPriority->key
        );
    }

    if (!$pickedBoardStatusId || !$pickedBoardPriorityId) {
        return back()->with('alert', [
            'type' => 'error',
            'message' => 'Board masters for EPIC are not configured yet (status/priority).',
        ]);
    }

    Epic::create([
        'uuid' => (string) Str::uuid(),
        'board_uuid' => $board->uuid,
        'code' => UniqueCode::epic(),
        'title' => $validated['title'],
        'description' => $validated['description'] ?? null,

        // ✅ store BOARD ids (FK safe)
        'status_id' => $pickedBoardStatusId,
        'priority_id' => $pickedBoardPriorityId,

        'created_by' => $request->user()->id,
    ]);

    return redirect()->route('epics.index', $board)->with('alert', [
        'type' => 'success',
        'message' => 'Epic created.',
    ]);
    if (!$boardStatusId || !$boardPriorityId) {
    $keys = $this->getGlobalDefaultKeys('EPIC');

    $boardStatusId = $boardStatusId ?: $this->mapBoardStatusIdByKey($board->uuid, 'EPIC', $keys['status_key']);
    $boardPriorityId = $boardPriorityId ?: $this->mapBoardPriorityIdByKey($board->uuid, 'EPIC', $keys['priority_key']);
}

if (!$boardStatusId || !$boardPriorityId) {
    return back()->with('alert', [
        'type' => 'error',
        'message' => 'Board masters for EPIC are not configured yet (status/priority).',
    ]);
}
}

/**
 * ✅ Validate board master IDs
 */
private function validateBoardStatusId(string $boardUuid, string $scope, ?int $id): ?int
{
    if (!$id) return null;

    $ok = BoardStatus::query()
        ->where('id', $id)
        ->where('board_uuid', $boardUuid)
        ->where('scope', $scope)
        ->where('is_active', 1)
        ->exists();

    return $ok ? $id : null;
}

private function validateBoardPriorityId(string $boardUuid, string $scope, ?int $id): ?int
{
    if (!$id) return null;

    $ok = BoardPriority::query()
        ->where('id', $id)
        ->where('board_uuid', $boardUuid)
        ->where('scope', $scope)
        ->where('is_active', 1)
        ->exists();

    return $ok ? $id : null;
}

/**
 * ✅ Map global default key -> board master id (with fallback)
 */
private function mapGlobalStatusToBoardStatusId(string $boardUuid, string $scope, string $globalKey): ?int
{
    $status = BoardStatus::query()
        ->where('board_uuid', $boardUuid)
        ->where('scope', $scope)
        ->where('key', $globalKey)
        ->where('is_active', 1)
        ->first();

    if ($status) return $status->id;

    // fallback: first active by position
    $fallback = BoardStatus::query()
        ->where('board_uuid', $boardUuid)
        ->where('scope', $scope)
        ->where('is_active', 1)
        ->orderBy('position')
        ->first();

    return $fallback?->id;
}

private function mapGlobalPriorityToBoardPriorityId(string $boardUuid, string $scope, string $globalKey): ?int
{
    $prio = BoardPriority::query()
        ->where('board_uuid', $boardUuid)
        ->where('scope', $scope)
        ->where('key', $globalKey)
        ->where('is_active', 1)
        ->first();

    if ($prio) return $prio->id;

    // fallback: first active by position
    $fallback = BoardPriority::query()
        ->where('board_uuid', $boardUuid)
        ->where('scope', $scope)
        ->where('is_active', 1)
        ->orderBy('position')
        ->first();

    return $fallback?->id;
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
        Log::info('EPIC UPDATE PRE-AUTH', [
  'user_id' => $request->user()?->id,
  'can_update_epic' => $request->user()?->hasPermission('update_epic'),
]);
abort_unless(...);


        abort_unless($request->user()?->hasPermission('update_epic'), 403);

        $validated = $request->validate([
            'code' => ['sometimes', 'nullable', 'string', 'max:30', 'unique:epics,code,' . $epic->uuid . ',uuid'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'status_id' => ['sometimes', 'nullable', 'integer'],
            'priority_id' => ['sometimes', 'nullable', 'integer'],
        ]);
        \Log::info('EPIC UPDATE VALIDATED', [
    'epic_uuid' => $epic->uuid,
    'validated' => $validated,
    'raw' => $request->all(),
]);
\Log::info('EPIC UPDATE EMPTY_CHECK', [
    'is_empty' => empty($validated),
]);


        if (empty($validated)) return back();

        if (array_key_exists('status_id', $validated)) {
             \Log::info('EPIC UPDATE WILL_VALIDATE_STATUS', [
        'epic_uuid' => $epic->uuid,
        'board_uuid' => $epic->board_uuid,
        'incoming_status_id' => $validated['status_id'],
    ]);
           $newStatusId = $this->validateBoardStatusId($epic->board_uuid, 'EPIC', $validated['status_id']);

            if (!$newStatusId) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => 'Invalid status for EPIC scope.',
                ]);
            }
            $validated['status_id'] = $newStatusId;
        }

        if (array_key_exists('priority_id', $validated)) {
           $newPriorityId = $this->validateBoardPriorityId($epic->board_uuid, 'EPIC', $validated['priority_id']);

            if (!$newPriorityId) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => 'Invalid priority for EPIC scope.',
                ]);
            }
            $validated['priority_id'] = $newPriorityId;
        }
        
foreach ($validated as $k => $v) {
    $epic->{$k} = $v;
}

$epic->save();

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

    private function mapBoardStatusIdByKey(string $boardUuid, string $scope, ?string $key): ?int
{
    if (!$key) return null;

    $id = DB::table('board_statuses')
        ->where('board_uuid', $boardUuid)
        ->where('scope', $scope)
        ->where('key', $key)
        ->where('is_active', 1)
        ->value('id');

    if ($id) return (int) $id;

    // fallback first active by position
    $fallback = DB::table('board_statuses')
        ->where('board_uuid', $boardUuid)
        ->where('scope', $scope)
        ->where('is_active', 1)
        ->orderBy('position')
        ->value('id');

    return $fallback ? (int) $fallback : null;
}

private function mapBoardPriorityIdByKey(string $boardUuid, string $scope, ?string $key): ?int
{
    if (!$key) return null;

    $id = DB::table('board_priorities')
        ->where('board_uuid', $boardUuid)
        ->where('scope', $scope)
        ->where('key', $key)
        ->where('is_active', 1)
        ->value('id');

    if ($id) return (int) $id;

    // fallback first active by position
    $fallback = DB::table('board_priorities')
        ->where('board_uuid', $boardUuid)
        ->where('scope', $scope)
        ->where('is_active', 1)
        ->orderBy('position')
        ->value('id');

    return $fallback ? (int) $fallback : null;
}

}
