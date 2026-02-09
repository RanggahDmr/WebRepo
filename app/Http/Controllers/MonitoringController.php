<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Epic;
use App\Models\Story;
use App\Models\Task;
use App\Models\User;
use App\Models\BoardStatus;
use App\Models\BoardPriority;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonitoringController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->get('tab', 'tasks');
        if (!in_array($tab, ['tasks', 'stories', 'epics'], true)) {
            $tab = 'tasks';
        }

        $scope = $tab === 'tasks' ? 'TASK' : ($tab === 'stories' ? 'STORY' : 'EPIC');

        // filters (selalu dikirim biar FE stabil)
        $filters = $request->only([
            'tab',
            'board',
            'epic',          // only tasks/stories
            'status_id',
            'priority_id',
            'sort',
            'direction',
        ]);

        $direction = $request->get('direction', 'desc') === 'asc' ? 'asc' : 'desc';

        // dropdown
        $boards = Board::query()
            ->orderBy('title')
            ->get(['uuid', 'title']);

        $epicsOptions = Epic::query()
            ->when($request->board, fn($q, $boardUuid) => $q->where('board_uuid', $boardUuid))
            ->orderBy('updated_at', 'desc')
            ->get(['uuid', 'board_uuid', 'code', 'title']);

        // ===== masters (per board + scope) =====
        $statuses = null;
        $priorities = null;

        if ($request->board) {
            $statuses = BoardStatus::query()
                ->where('board_uuid', $request->board)
                ->where('scope', $scope)
                ->where('is_active', true)
                ->orderBy('position')
                ->get(['id', 'key', 'name', 'color', 'position', 'is_done', 'is_default']);

            $priorities = BoardPriority::query()
                ->where('board_uuid', $request->board)
                ->where('scope', $scope)
                ->where('is_active', true)
                ->orderBy('position')
                ->get(['id', 'key', 'name', 'color', 'position', 'is_default']);
        }

        // =========================
        // TASKS
        // =========================
        if ($tab === 'tasks') {
            $base = Task::query()
                ->when($request->board, function ($q, $boardUuid) {
                    $q->whereHas('story.epic', fn($qq) => $qq->where('board_uuid', $boardUuid));
                })
                ->when($request->epic, fn($q, $epicUuid) =>
                    $q->whereHas('story', fn($qq) => $qq->where('epic_uuid', $epicUuid))
                )
                ->when($request->status_id, fn($q, $id) => $q->where('status_id', $id))
                ->when($request->priority_id, fn($q, $id) => $q->where('priority_id', $id));

            $sort = $request->get('sort', 'created_at');
            $allowedSort = ['created_at', 'updated_at', 'status_pos', 'priority_pos', 'uuid'];
            if (!in_array($sort, $allowedSort, true)) $sort = 'created_at';

            $list = (clone $base)
                ->with([
                    'creator:id,name',
                    'assignee:id,name,role',
                    'story:uuid,epic_uuid,code,title',
                    'story.epic:uuid,board_uuid,code,title',
                    'story.epic.board:uuid,squad_code,title',
                    'statusMaster:id,key,name,color,is_done,position',
                    'priorityMaster:id,key,name,color,position',
                ]);

            if ($sort === 'status_pos') {
                $list->leftJoin('board_statuses as bs', 'bs.id', '=', 'tasks.status_id')
                    ->orderBy('bs.position', $direction)
                    ->select('tasks.*');
            } elseif ($sort === 'priority_pos') {
                $list->leftJoin('board_priorities as bp', 'bp.id', '=', 'tasks.priority_id')
                    ->orderBy('bp.position', $direction)
                    ->select('tasks.*');
            } else {
                $list->orderBy($sort, $direction);
            }

            $tasks = $list->paginate(5)->withQueryString();

            $progress = $this->buildProgressByStatus($base, 'tasks');

                $first = $tasks->items()[0] ?? null;

logger()->info('MONITORING_TASK_DEBUG', [
    'uuid' => $first?->uuid,
    'status_id' => $first?->status_id,
    'priority_id' => $first?->priority_id,
    'statusMaster' => $first?->relationLoaded('statusMaster') ? $first->statusMaster?->only(['id','name','color','key']) : 'NOT_LOADED',
    'priorityMaster' => $first?->relationLoaded('priorityMaster') ? $first->priorityMaster?->only(['id','name','color','key']) : 'NOT_LOADED',
]);


            return Inertia::render('Monitoring/Tasks', [
                'tab' => $tab,
                'scope' => $scope,

                'tasks' => $tasks,
                'progress' => $progress,
                'filters' => $filters,

                'boards' => $boards,
                'epicsOptions' => $epicsOptions,

                'statuses' => $statuses,
                'priorities' => $priorities,
            ]);
        }

        // =========================
        // STORIES
        // =========================
        if ($tab === 'stories') {
            $base = Story::query()
                ->when($request->board, fn($q, $boardUuid) =>
                    $q->whereHas('epic', fn($qq) => $qq->where('board_uuid', $boardUuid))
                )
                ->when($request->epic, fn($q, $epicUuid) => $q->where('epic_uuid', $epicUuid))
                ->when($request->role, fn($q, $role) =>
                    $q->whereHas('creator', fn($qq) => $qq->where('role', $role))
                )
                ->when($request->status_id, fn($q, $id) => $q->where('status_id', $id))
                ->when($request->priority_id, fn($q, $id) => $q->where('priority_id', $id));

            $sort = $request->get('sort', 'updated_at');
            $allowedSort = ['created_at', 'updated_at', 'status_pos', 'priority_pos', 'uuid', 'code', 'title'];
            if (!in_array($sort, $allowedSort, true)) $sort = 'updated_at';

            $list = (clone $base)
                ->with([
                    'epic:uuid,board_uuid,code,title',
                    'epic.board:uuid,title,squad_code',
                    'creator:id,name,role',
                    'statusMaster:id,key,name,color,is_done,position',
                    'priorityMaster:id,key,name,color,position',
                ]);

            if ($sort === 'status_pos') {
                $list->leftJoin('board_statuses as bs', 'bs.id', '=', 'stories.status_id')
                    ->orderBy('bs.position', $direction)
                    ->select('stories.*');
            } elseif ($sort === 'priority_pos') {
                $list->leftJoin('board_priorities as bp', 'bp.id', '=', 'stories.priority_id')
                    ->orderBy('bp.position', $direction)
                    ->select('stories.*');
            } else {
                $list->orderBy($sort, $direction);
            }

            $stories = $list->paginate(5)->withQueryString();

            $progress = $this->buildProgressByStatus($base, 'stories');

            return Inertia::render('Monitoring/Stories', [
                'tab' => $tab,
                'scope' => $scope,

                'stories' => $stories,
                'progress' => $progress,
                'filters' => $filters,

                'boards' => $boards,
                'epicsOptions' => $epicsOptions,

                'statuses' => $statuses,
                'priorities' => $priorities,
            ]);
        }

        // =========================
        // EPICS
        // =========================
        $base = Epic::query()
            ->when($request->board, fn($q, $boardUuid) => $q->where('epics.board_uuid', $boardUuid))
            ->when($request->role, fn($q, $role) =>
                $q->whereHas('creator', fn($qq) => $qq->where('role', $role))
            )
            ->when($request->status_id, fn($q, $id) => $q->where('status_id', $id))
            ->when($request->priority_id, fn($q, $id) => $q->where('priority_id', $id));

        $sort = $request->get('sort', 'updated_at');
        $allowedSort = ['created_at', 'updated_at', 'status_pos', 'priority_pos', 'uuid', 'code', 'title'];
        if (!in_array($sort, $allowedSort, true)) $sort = 'updated_at';

        $list = (clone $base)
            ->with([
                'board:uuid,title,squad_code',
                'creator:id,name,role',
                'statusMaster:id,key,name,color,is_done,position',
                'priorityMaster:id,key,name,color,position',
            ]);

        if ($sort === 'status_pos') {
            $list->leftJoin('board_statuses as bs', 'bs.id', '=', 'epics.status_id')
                ->orderBy('bs.position', $direction)
                ->select('epics.*');
        } elseif ($sort === 'priority_pos') {
            $list->leftJoin('board_priorities as bp', 'bp.id', '=', 'epics.priority_id')
                ->orderBy('bp.position', $direction)
                ->select('epics.*');
        } else {
            $list->orderBy($sort, $direction);
        }

        $epics = $list->paginate(5)->withQueryString();

        $progress = $this->buildProgressByStatus($base, 'epics');


        return Inertia::render('Monitoring/Epics', [
            'tab' => $tab,
            'scope' => $scope,

            'epics' => $epics,
            'progress' => $progress,
            'filters' => $filters,

            'boards' => $boards,
            'epicsOptions' => $epicsOptions,

            'statuses' => $statuses,
            'priorities' => $priorities,
        ]);
    }
    private function buildProgressByStatus(\Illuminate\Database\Eloquent\Builder $base, string $table)
{
    // total (ikut filter base)
    $total = (clone $base)->count();

    // breakdown by master status (urut position)
    $rows = (clone $base)
        ->leftJoin('board_statuses as bs', 'bs.id', '=', "{$table}.status_id")
        ->selectRaw("
            bs.id as id,
            bs.name as name,
            bs.color as color,
            bs.is_done as is_done,
            bs.position as position,
            COUNT(*) as count
        ")
        ->groupBy('bs.id', 'bs.name', 'bs.color', 'bs.is_done', 'bs.position')
        ->orderByRaw("CASE WHEN bs.position IS NULL THEN 1 ELSE 0 END, bs.position ASC")
        ->get();

    $byStatus = $rows->map(function ($r) {
        // kalau status_id null → id & name null
        if (!$r->id) {
            return [
                'id' => null,
                'name' => 'Unassigned',
                'color' => '#9CA3AF', // gray-400
                'is_done' => null,
                'count' => (int) $r->count,
            ];
        }

        return [
            'id' => (int) $r->id,
            'name' => (string) ($r->name ?? '-'),
            'color' => $r->color,
            'is_done' => is_null($r->is_done) ? null : (bool) $r->is_done,
            'count' => (int) $r->count,
        ];
            })->values();

            // done/open berdasarkan is_done
            $doneRow = (clone $base)
                ->leftJoin('board_statuses as bs', 'bs.id', '=', "{$table}.status_id")
                ->selectRaw("SUM(CASE WHEN bs.is_done = 1 THEN 1 ELSE 0 END) as done")
                ->first();

            $done = (int) ($doneRow?->done ?? 0);
            $open = max(0, $total - $done);

            return [
                'total' => $total,
                'done' => $done,
                'open' => $open,
                'by_status' => $byStatus,
            ];
        }

}
