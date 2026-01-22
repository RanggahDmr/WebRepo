<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonitoringController extends Controller
{
    public function index(Request $request)
    {
        $sort = $request->get('sort', 'created_at');
        $direction = $request->get('direction', 'desc');

        // (Optional) whitelist sorting biar aman
        $allowedSorts = ['created_at', 'updated_at', 'priority', 'status', 'id'];
        if (!in_array($sort, $allowedSorts, true)) {
            $sort = 'created_at';
        }
        $direction = $direction === 'asc' ? 'asc' : 'desc';

        /*
        |--------------------------------------------------------------------------
        | FILTERED TASKS (TABLE + KANBAN)
        |--------------------------------------------------------------------------
        */
        $tasks = Task::query()
            ->with([
                
                'creator:id,name',
                'assignee:id,name,role',
                'story:id,epic_id,code,title',
                'story.epic:id,code,create_work',
            ])

            ->when($request->role, function ($q, $role) {
                $q->whereHas('assignee', fn ($q) => $q->where('role', $role));
            })

            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->priority, fn ($q, $priority) => $q->where('priority', $priority))

            ->orderBy($sort, $direction)
            ->paginate(5)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | GLOBAL PROGRESS (NO FILTER)
        |--------------------------------------------------------------------------
        */
        $progress = Task::selectRaw("
                COUNT(*) as total,
                SUM(status = 'TODO') as todo,
                SUM(status = 'IN_PROGRESS') as in_progress,
                SUM(status = 'IN_REVIEW') as in_review,
                SUM(status = 'DONE') as done
            ")
            ->first();

        return Inertia::render('Monitoring/Index', [
            'tasks' => $tasks,
            'progress' => $progress,
            'filters' => $request->only([
                'role',
                'status',
                'priority',
                'sort',
                'direction',
            ]),
            'roles' => User::select('role')->distinct()->pluck('role'),
        ]);
    }
}
