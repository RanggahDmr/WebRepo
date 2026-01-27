<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Epic;
use App\Models\Story;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MonitoringController extends Controller
{
 public function index(Request $request)
{
    $tab = $request->get('tab', 'tasks');
    if (!in_array($tab, ['tasks', 'stories', 'epics'], true)) $tab = 'tasks';

    $sort = $request->get('sort', $tab === 'tasks' ? 'created_at' : 'updated_at');
    $direction = $request->get('direction', 'desc') === 'asc' ? 'asc' : 'desc';

    $roles = User::select('role')->distinct()->pluck('role');

    // filters yg selalu dikirim biar dropdown/tab aman
    $filters = $request->only([
        'tab', 'board', 'epic', 'role', 'status', 'priority', 'sort', 'direction',
    ]);

    // ===== TASKS =====
    if ($tab === 'tasks') {
        $allowedSorts = ['created_at', 'updated_at', 'priority', 'status', 'uuid'];
        if (!in_array($sort, $allowedSorts, true)) $sort = 'created_at';

        $base = Task::query()
    // board filter via story -> epic -> board
    ->when($request->board, function ($q, $boardUuid) {
        $q->whereHas('story.epic', fn ($qq) => $qq->where('board_uuid', $boardUuid));
    })
    // epic filter via story
    ->when($request->epic, fn ($q, $epicUuid) => $q->whereHas('story', fn ($qq) => $qq->where('epic_uuid', $epicUuid)))
    // status/priority
    ->when($request->status, fn ($q, $status) => $q->where('status', $status))
    ->when($request->priority, fn ($q, $priority) => $q->where('priority', $priority));


        $tasks = (clone $base)
            ->with([
                'creator:id,name',
                'assignee:id,name,role',
                'story:uuid,epic_uuid,code,title',
                'story.epic:uuid,code,title',
                'story.epic.board:uuid,squad_code,title',
            ])
            ->orderBy($sort, $direction)
            ->paginate(5)
            ->withQueryString();

        $progress = (clone $base)->selectRaw("
            COUNT(*) as total,
            SUM(status = 'TODO') as todo,
            SUM(status = 'IN_PROGRESS') as in_progress,
            SUM(status = 'IN_REVIEW') as in_review,
            SUM(status = 'DONE') as done
        ")->first();

        return Inertia::render('Monitoring/Index', [
            'tab' => $tab,
            'tasks' => $tasks,
            'progress' => $progress,
            'filters' => $filters,
            'roles' => $roles,
        ]);
    }

    // data dropdown untuk tab stories/epics
    $boards = \App\Models\Board::query()
        ->orderBy('title')
        ->get(['uuid','title','squad_code']);

    // ===== EPICS =====
    if ($tab === 'epics') {
        $allowedSorts = ['created_at', 'updated_at', 'priority', 'status', 'uuid', 'code', 'title'];
        if (!in_array($sort, $allowedSorts, true)) $sort = 'updated_at';

        $base = \App\Models\Epic::query()
            ->when($request->board, fn($q, $boardUuid) => $q->where('board_uuid', $boardUuid))
            ->when($request->status, fn($q, $status) => $q->where('status', $status))
            ->when($request->priority, fn($q, $priority) => $q->where('priority', $priority))
            ->when($request->role, fn($q, $role) =>
                $q->whereHas('creator', fn($qq) => $qq->where('role', $role))
            );

        $epics = (clone $base)
            ->with(['board:uuid,title,squad_code', 'creator:id,name,role'])
            ->orderBy($sort, $direction)
            ->paginate(10)
            ->withQueryString();

        $progress = (clone $base)->selectRaw("
            COUNT(*) as total,
            SUM(status = 'TODO') as todo,
            SUM(status = 'IN_PROGRESS') as in_progress,
            SUM(status = 'IN_REVIEW') as in_review,
            SUM(status = 'DONE') as done
        ")->first();

        return Inertia::render('Monitoring/Index', [
            'tab' => $tab,
            'epics' => $epics,
            'boards' => $boards,
            'progress' => $progress,
            'filters' => $filters,
            'roles' => $roles,
        ]);
    }

    // ===== STORIES =====
    $allowedSorts = ['created_at', 'updated_at', 'priority', 'status', 'uuid', 'code', 'title'];
    if (!in_array($sort, $allowedSorts, true)) $sort = 'updated_at';

    $base = \App\Models\Story::query()
        ->when($request->board, fn($q, $boardUuid) =>
            $q->whereHas('epic', fn($qq) => $qq->where('board_uuid', $boardUuid))
        )
        ->when($request->epic, fn($q, $epicUuid) => $q->where('epic_uuid', $epicUuid))
        ->when($request->status, fn($q, $status) => $q->where('status', $status))
        ->when($request->priority, fn($q, $priority) => $q->where('priority', $priority))
        ->when($request->role, fn($q, $role) =>
            $q->whereHas('creator', fn($qq) => $qq->where('role', $role))
        );

    $stories = (clone $base)
        ->with([
            'epic:uuid,board_uuid,code,title',
            'epic.board:uuid,title,squad_code',
            'creator:id,name,role',
        ])
        ->orderBy($sort, $direction)
        ->paginate(10)
        ->withQueryString();

    $epicsOptions = \App\Models\Epic::query()
        ->when($request->board, fn($q, $boardUuid) => $q->where('board_uuid', $boardUuid))
        ->orderBy('updated_at', 'desc')
        ->get(['uuid','board_uuid','code','title']);

    $progress = (clone $base)->selectRaw("
        COUNT(*) as total,
        SUM(status = 'TODO') as todo,
        SUM(status = 'IN_PROGRESS') as in_progress,
        SUM(status = 'IN_REVIEW') as in_review,
        SUM(status = 'DONE') as done
    ")->first();

    return Inertia::render('Monitoring/Index', [
        'tab' => $tab,
        'stories' => $stories,
        'boards' => $boards,
        'epicsOptions' => $epicsOptions,
        'progress' => $progress,
        'filters' => $filters,
        'roles' => $roles,
    ]);
}



  public function epics(Request $request)
{
    $sort = $request->get('sort', 'updated_at');
    $direction = $request->get('direction', 'desc');

    // optional: whitelist sort
    $allowedSorts = ['created_at', 'updated_at', 'priority', 'status', 'uuid', 'code', 'title'];
    if (!in_array($sort, $allowedSorts, true)) $sort = 'updated_at';
    $direction = $direction === 'asc' ? 'asc' : 'desc';

    $base = \App\Models\Epic::query()
        // filter: board (uuid)
        ->when($request->board, fn ($q, $boardUuid) => $q->where('board_uuid', $boardUuid))
        // filter: status / priority
        ->when($request->status, fn ($q, $status) => $q->where('status', $status))
        ->when($request->priority, fn ($q, $priority) => $q->where('priority', $priority));
        // filter: role (creator role)
       

    $epics = (clone $base)
        ->with([
            'board:uuid,title,squad_code',
            'creator:id,name,role',
        ])
        ->orderBy($sort, $direction)
        ->get([
            'uuid','board_uuid','code','title','description',
            'priority','status','created_by','created_at','updated_at'
        ]);

    // ✅ progress ikut filter yang sama
    $progress = (clone $base)->selectRaw("
        COUNT(*) as total,
        SUM(status = 'TODO') as todo,
        SUM(status = 'IN_PROGRESS') as in_progress,
        SUM(status = 'IN_REVIEW') as in_review,
        SUM(status = 'DONE') as done
    ")->first();

    $boards = \App\Models\Board::query()
        ->orderBy('title')
        ->get(['uuid','title','squad_code']);

    return Inertia::render('Monitoring/Epics', [
        'epics' => $epics,
        'boards' => $boards,
        'progress' => $progress, // ✅ tambah
        'filters' => $request->only(['board','status','priority','role','view','sort','direction']),
        'roles' => User::select('role')->distinct()->pluck('role'), // ✅ tambah (biar dropdown role ada)
    ]);
}

   
public function stories(Request $request)
{
    $sort = $request->get('sort', 'updated_at');
    $direction = $request->get('direction', 'desc');

    $allowedSorts = ['created_at', 'updated_at', 'priority', 'status', 'uuid', 'code', 'title'];
    if (!in_array($sort, $allowedSorts, true)) $sort = 'updated_at';
    $direction = $direction === 'asc' ? 'asc' : 'desc';

    $base = \App\Models\Story::query()
        // filter: board via epic relation
        ->when($request->board, function ($q, $boardUuid) {
            $q->whereHas('epic', fn ($qq) => $qq->where('board_uuid', $boardUuid));
        })
        // filter: epic (uuid)
        ->when($request->epic, fn ($q, $epicUuid) => $q->where('epic_uuid', $epicUuid))
        // filter: status / priority
        ->when($request->status, fn ($q, $status) => $q->where('status', $status))
        ->when($request->priority, fn ($q, $priority) => $q->where('priority', $priority))
        // filter: role (creator role)
        ->when($request->role, function ($q, $role) {
            $q->whereHas('creator', fn ($qq) => $qq->where('role', $role));
        });

    $stories = (clone $base)
        ->with([
            'epic:uuid,board_uuid,code,title',
            'epic.board:uuid,title,squad_code',
            'creator:id,name,role',
        ])
        ->orderBy($sort, $direction)
        ->get([
            'uuid','epic_uuid','code','title','description',
            'priority','status','created_by','created_at','updated_at'
        ]);

    // ✅ progress ikut filter yang sama
    $progress = (clone $base)->selectRaw("
        COUNT(*) as total,
        SUM(status = 'TODO') as todo,
        SUM(status = 'IN_PROGRESS') as in_progress,
        SUM(status = 'IN_REVIEW') as in_review,
        SUM(status = 'DONE') as done
    ")->first();

    $boards = \App\Models\Board::query()
        ->orderBy('title')
        ->get(['uuid','title','squad_code']);

    $epics = \App\Models\Epic::query()
        ->when($request->board, fn ($q, $boardUuid) => $q->where('board_uuid', $boardUuid))
        ->orderBy('updated_at', 'desc')
        ->get(['uuid','board_uuid','code','title']);

    return Inertia::render('Monitoring/Stories', [
        'stories' => $stories,
        'boards' => $boards,
        'epics' => $epics,
        'progress' => $progress, // ✅ tambah
        'filters' => $request->only(['board','epic','status','priority','role','view','sort','direction']),
        'roles' => User::select('role')->distinct()->pluck('role'), // ✅ tambah
    ]);
}


}
