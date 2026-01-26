<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Task;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BoardMonitoringController extends Controller
{
    public function index(Request $request, Board $board)
    {
        // ===== 1) Read filters =====
        $role      = $request->string('role')->toString();       // e.g PROGRAMMER/PM/SAD/QA etc
        $status    = $request->string('status')->toString();     // TODO/IN_PROGRESS/IN_REVIEW/DONE
        $priority  = $request->string('priority')->toString();   // depends on your enum/string
        $sort      = $request->string('sort', 'created_at')->toString();
        $direction = strtolower($request->string('direction', 'desc')->toString()) === 'asc' ? 'asc' : 'desc';

        $perPage   = (int) $request->integer('per_page', 20);

        // Whitelist sortable columns (hindari SQL injection + sort random)
        $allowedSorts = ['created_at', 'updated_at', 'priority', 'status', 'position'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }

        // ===== 2) Base query (SCOPED BY BOARD) =====
        $base = Task::query()
            ->whereHas('story.epic', function ($q) use ($board) {
                $q->where('board_uuid', $board->uuid);
            });

        // ===== 3) Progress (scoped by board + filters* optional) =====
        // Umumnya progress bar hanya scoped by board (tanpa role/priority), tapi kamu bisa
        // kalau mau progress ikut filter: copy filter logic ke $progressBase.
        $progressBase = (clone $base);

        $countsByStatus = $progressBase
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status'); // ['TODO' => 10, ...]

        $progress = [
            'total'       => (int) ($countsByStatus->sum()),
            'todo'        => (int) ($countsByStatus['TODO'] ?? 0),
            'in_progress' => (int) ($countsByStatus['IN_PROGRESS'] ?? 0),
            'in_review'   => (int) ($countsByStatus['IN_REVIEW'] ?? 0),
            'done'        => (int) ($countsByStatus['DONE'] ?? 0),
        ];

        // ===== 4) Apply filters to list query =====
        $query = (clone $base)
            ->when($role !== '', function ($q) use ($role) {
                $q->whereHas('assignee', fn ($qq) => $qq->where('role', $role));
            })
            ->when($status !== '', fn ($q) => $q->where('status', $status))
            ->when($priority !== '', fn ($q) => $q->where('priority', $priority));

        // ===== 5) Eager load relations for TaskDetailCard =====
        // include: creator, assignee, story.code, epic.code/title, (board info already in props)
        $query->with([
            'creator:id,name,role',
            'assignee:id,name,role',
            'story:uuid,epic_uuid,code,title',
            'story.epic:uuid,board_uuid,code,title',
        ]);

        // ===== 6) Select fields (recommended biar payload kecil) =====
        $query->select([
            'uuid',
            'story_uuid',
            'code',
            'title',
            'description',
            'type',
            'priority',
            'status',
            'position',
            'assignee_id',
            'created_by',
            'created_at',
            'updated_at',
        ]);

        // ===== 7) Sort + paginate (preserve query string) =====
        $tasks = $query
            ->orderBy($sort, $direction)
            ->paginate($perPage)
            ->withQueryString();

        // ===== 8) Inertia props =====
        return Inertia::render('Monitoring/Index', [
            'board' => [
                'uuid'       => $board->uuid,
                'title'      => $board->title,
                'squad_code' => $board->squad_code,
                'created_at' => $board->created_at,
                'updated_at' => $board->updated_at,
            ],
            'tasks' => $tasks,
            'filters' => [
                'role'      => $role,
                'status'    => $status,
                'priority'  => $priority,
                'sort'      => $sort,
                'direction' => $direction,
                'per_page'  => $perPage,
            ],
            'progress' => $progress,
        ]);
    }
}
