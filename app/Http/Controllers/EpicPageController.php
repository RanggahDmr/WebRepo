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
use App\Models\BoardStatus;
use App\Models\BoardPriority;

class EpicPageController extends Controller
{
    /**
     * Helper: pastikan user member board
     * Return redirect response (non-inertia) / abort 403 (inertia) / null if ok
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

    private function getMasters(Board $board, string $scope): array
    {
        $statuses = BoardStatus::query()
            ->where('board_uuid', $board->uuid)
            ->where('scope', $scope)
            ->where('is_active', true)
            ->orderBy('position')
            ->get(['id', 'key', 'name', 'color', 'is_done', 'is_default']);

        $priorities = BoardPriority::query()
            ->where('board_uuid', $board->uuid)
            ->where('scope', $scope)
            ->where('is_active', true)
            ->orderBy('position')
            ->get(['id', 'key', 'name', 'color', 'is_default']);

        return [$statuses, $priorities];
    }

    /**
     * Resolve master IDs:
     * - prefer status_id/priority_id
     * - fallback legacy status/priority strings
     * - else use default master per scope
     * - always ensure belongs to same board + scope + active
     */
    private function resolveIds(Board $board, string $scope, array $validated): array
    {
        $statusMap = [
            'TODO' => 'backlog',
            'BACKLOG' => 'backlog',
            'IN_PROGRESS' => 'in_progress',
            'IN REVIEW' => 'in_review',
            'IN_REVIEW' => 'in_review',
            'DONE' => 'done',
        ];

        $priorityMap = [
            'LOW' => 'low',
            'MEDIUM' => 'medium',
            'HIGH' => 'high',
        ];

        // ===== STATUS =====
        $statusId = $validated['status_id'] ?? null;

        if (!$statusId && !empty($validated['status'])) {
            $legacy = strtoupper(trim($validated['status']));
            $key = $statusMap[$legacy] ?? null;

            if ($key) {
                $statusId = BoardStatus::query()
                    ->where('board_uuid', $board->uuid)
                    ->where('scope', $scope)
                    ->where('key', $key)
                    ->where('is_active', true)
                    ->value('id');
            }
        }

        if (!$statusId) {
            $statusId = BoardStatus::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $scope)
                ->where('is_default', true)
                ->where('is_active', true)
                ->value('id');
        }

        // ===== PRIORITY =====
        $priorityId = $validated['priority_id'] ?? null;

        if (!$priorityId && !empty($validated['priority'])) {
            $legacy = strtoupper(trim($validated['priority']));
            $key = $priorityMap[$legacy] ?? null;

            if ($key) {
                $priorityId = BoardPriority::query()
                    ->where('board_uuid', $board->uuid)
                    ->where('scope', $scope)
                    ->where('key', $key)
                    ->where('is_active', true)
                    ->value('id');
            }
        }

        if (!$priorityId) {
            $priorityId = BoardPriority::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $scope)
                ->where('is_default', true)
                ->where('is_active', true)
                ->value('id');
        }

        // ===== SAFETY (must exist, must belong) =====
        $status = null;
        if ($statusId) {
            $status = BoardStatus::query()
                ->where('id', $statusId)
                ->where('board_uuid', $board->uuid)
                ->where('scope', $scope)
                ->where('is_active', true)
                ->firstOrFail();
        }

        $priority = null;
        if ($priorityId) {
            $priority = BoardPriority::query()
                ->where('id', $priorityId)
                ->where('board_uuid', $board->uuid)
                ->where('scope', $scope)
                ->where('is_active', true)
                ->firstOrFail();
        }

        return [$status?->id, $priority?->id];
    }

    private function legacyStatusFromMasterKey(?string $key): string
    {
        return match ($key) {
            'backlog' => 'TODO',
            'in_progress' => 'IN_PROGRESS',
            'in_review' => 'IN_REVIEW',
            'done' => 'DONE',
            default => 'TODO',
        };
    }

    private function legacyPriorityFromMasterKey(?string $key): string
    {
        return match ($key) {
            'low' => 'LOW',
            'medium' => 'MEDIUM',
            'high' => 'HIGH',
            default => 'MEDIUM',
        };
    }

    public function index(Request $request, Board $board)
    {
        if ($resp = $this->ensureBoardMember($request, $board)) return $resp;

        [$epicStatuses, $epicPriorities] = $this->getMasters($board, 'EPIC');

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
                // legacy
                'priority',
                'status',
                // new
                'priority_id',
                'status_id',
                'created_by',
                'created_at',
                'updated_at',
            ]);

        return Inertia::render('Dashboard/Index', [
            'board' => $board->only(['uuid', 'squad_code', 'title', 'created_at']),
            'epics' => $epics,
            'epicStatuses' => $epicStatuses,
            'epicPriorities' => $epicPriorities,
        ]);
    }

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

        [$storyStatuses, $storyPriorities] = $this->getMasters($board, 'STORY');

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
                // legacy
                'priority',
                'status',
                // new
                'priority_id',
                'status_id',
                'created_by',
                'created_at',
                'updated_at',
            ]);

        return Inertia::render('Epics/Show', [
    'board' => $board->only(['uuid', 'squad_code', 'title', 'created_at']),
    'epic' => [
        ...$epic->only([
            'uuid','board_uuid','code','title','description',
            'priority','status','priority_id','status_id',
            'created_by','created_at','updated_at',
        ]),
        'creator' => $epic->creator?->only(['id','name']),
        'priorityMaster' => $epic->priorityMaster
            ? $epic->priorityMaster->only(['id','key','name','color'])
            : null,
        'statusMaster' => $epic->statusMaster
            ? $epic->statusMaster->only(['id','key','name','color','is_done'])
            : null,
    ],
    'stories' => $stories,
    'storyStatuses' => $storyStatuses,
    'storyPriorities' => $storyPriorities,
]);

    }

    /**
     * Create Epic
     */
    public function store(Request $request, Board $board)
    {
        if ($resp = $this->ensureBoardMember($request, $board)) return $resp;

        abort_unless($request->user()?->hasPermission('create_epic'), 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

            // preferred
            'status_id' => ['nullable', 'integer'],
            'priority_id' => ['nullable', 'integer'],

            // legacy optional
            'status' => ['nullable', 'string'],
            'priority' => ['nullable', 'string'],
        ]);

        [$statusId, $priorityId] = $this->resolveIds($board, 'EPIC', $validated);

        // ambil key master utk legacy string
        $statusKey = $statusId
            ? BoardStatus::whereKey($statusId)->value('key')
            : null;

        $priorityKey = $priorityId
            ? BoardPriority::whereKey($priorityId)->value('key')
            : null;

        Epic::create([
            'uuid' => (string) Str::uuid(),
            'board_uuid' => $board->uuid,
            'code' => UniqueCode::epic(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,

            'status_id' => $statusId,
            'priority_id' => $priorityId,

            // legacy keep (MVP backward compatible)
            'status' => $this->legacyStatusFromMasterKey($statusKey),
            'priority' => $this->legacyPriorityFromMasterKey($priorityKey),

            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('epics.index', $board)->with('alert', [
            'type' => 'success',
            'message' => 'Epic created.',
        ]);
    }

    /**
     * Update Epic
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

            'status' => ['sometimes', 'nullable', 'string'],
            'priority' => ['sometimes', 'nullable', 'string'],
        ]);

        if (empty($validated)) return back();

       // cek field mana yang benar-benar diminta update oleh request
$wantsStatus =
    array_key_exists('status_id', $validated) ||
    array_key_exists('status', $validated);

$wantsPriority =
    array_key_exists('priority_id', $validated) ||
    array_key_exists('priority', $validated);

if ($wantsStatus || $wantsPriority) {
    // buat payload resolve yang "lengkap", supaya field yang tidak diubah
    // tetap pakai nilai existing (tidak jatuh ke default)
    $forResolve = $validated;

    if (!$wantsStatus) {
        $forResolve['status_id'] = $epic->status_id;
        $forResolve['status'] = $epic->status;
    }

    if (!$wantsPriority) {
        $forResolve['priority_id'] = $epic->priority_id;
        $forResolve['priority'] = $epic->priority;
    }

    [$statusId, $priorityId] = $this->resolveIds($board, 'EPIC', $forResolve);

    // IMPORTANT: hanya set field yang memang diminta update
    if ($wantsStatus) {
        $validated['status_id'] = $statusId;
        $statusKey = $statusId ? BoardStatus::whereKey($statusId)->value('key') : null;
        $validated['status'] = $this->legacyStatusFromMasterKey($statusKey);
    }

    if ($wantsPriority) {
        $validated['priority_id'] = $priorityId;
        $priorityKey = $priorityId ? BoardPriority::whereKey($priorityId)->value('key') : null;
        $validated['priority'] = $this->legacyPriorityFromMasterKey($priorityKey);
    }
}

        $epic->update($validated);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Epic updated.',
        ]);
    }

    /**
     * Create Story
     */
    public function storeStory(Request $request, Epic $epic)
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

        abort_unless($request->user()?->hasPermission('create_story'), 403);

        return DB::transaction(function () use ($request, $epic, $board) {
            $validated = $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],

                'status_id' => ['nullable', 'integer'],
                'priority_id' => ['nullable', 'integer'],

                'status' => ['nullable', 'string'],
                'priority' => ['nullable', 'string'],
            ]);

            [$statusId, $priorityId] = $this->resolveIds($board, 'STORY', $validated);

            $statusKey = $statusId ? BoardStatus::whereKey($statusId)->value('key') : null;
            $priorityKey = $priorityId ? BoardPriority::whereKey($priorityId)->value('key') : null;

            Story::create([
                'uuid' => (string) Str::uuid(),
                'code' => UniqueCode::story(),
                'epic_uuid' => $epic->uuid,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,

                'status_id' => $statusId,
                'priority_id' => $priorityId,

                // legacy keep
                'status' => $this->legacyStatusFromMasterKey($statusKey),
                'priority' => $this->legacyPriorityFromMasterKey($priorityKey),

                'created_by' => $request->user()->id,
            ]);

            return redirect()->route('epics.show', $epic)->with('alert', [
                'type' => 'success',
                'message' => 'Story created.',
            ]);
        });
    }

    /**
     * Update Story
     */
    public function updateStory(Request $request, Story $story)
    {
        $story->load('epic.board');
        $board = $story->epic?->board;

        if (!$board) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => 'Board not found for this story.',
            ]);
        }

        if ($resp = $this->ensureBoardMember($request, $board)) return $resp;

        abort_unless($request->user()?->hasPermission('update_story'), 403);

        $validated = $request->validate([
            'code' => ['sometimes', 'nullable', 'string', 'max:30', 'unique:stories,code,' . $story->uuid . ',uuid'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],

            'status_id' => ['sometimes', 'nullable', 'integer'],
            'priority_id' => ['sometimes', 'nullable', 'integer'],

            'status' => ['sometimes', 'nullable', 'string'],
            'priority' => ['sometimes', 'nullable', 'string'],
        ]);

        if (empty($validated)) return back();

      // cek field mana yang benar-benar diminta update oleh request
$wantsStatus =
    array_key_exists('status_id', $validated) ||
    array_key_exists('status', $validated);

$wantsPriority =
    array_key_exists('priority_id', $validated) ||
    array_key_exists('priority', $validated);

if ($wantsStatus || $wantsPriority) {
    // buat payload resolve yang "lengkap", supaya field yang tidak diubah
    // tetap pakai nilai existing (tidak jatuh ke default)
    $forResolve = $validated;

    if (!$wantsStatus) {
        $forResolve['status_id'] = $story->status_id;
        $forResolve['status'] = $story->status;
    }

    if (!$wantsPriority) {
        $forResolve['priority_id'] = $story->priority_id;
        $forResolve['priority'] = $story->priority;
    }

    [$statusId, $priorityId] = $this->resolveIds($board, 'STORY', $forResolve);

    // IMPORTANT: hanya set field yang memang diminta update
    if ($wantsStatus) {
        $validated['status_id'] = $statusId;
        $statusKey = $statusId ? BoardStatus::whereKey($statusId)->value('key') : null;
        $validated['status'] = $this->legacyStatusFromMasterKey($statusKey);
    }

    if ($wantsPriority) {
        $validated['priority_id'] = $priorityId;
        $priorityKey = $priorityId ? BoardPriority::whereKey($priorityId)->value('key') : null;
        $validated['priority'] = $this->legacyPriorityFromMasterKey($priorityKey);
    }
}


        $story->update($validated);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Story updated.',
        ]);
    }

    public function destroy(Request $request, Epic $epic)
    {
        $epic->load('board');
        $board = $epic->board;

        if ($board && ($resp = $this->ensureBoardMember($request, $board))) {
            return $resp;
        }

        abort_unless($request->user()?->hasPermission('delete_epic'), 403);

        $epic->delete();

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Epic deleted.',
        ]);
    }

    public function destroyStory(Request $request, Story $story)
    {
        $story->load('epic.board');
        $board = $story->epic?->board;

        if ($board && ($resp = $this->ensureBoardMember($request, $board))) {
            return $resp;
        }

        abort_unless($request->user()?->hasPermission('delete_story'), 403);

        $story->delete();

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Story deleted.',
        ]);
    }
}
