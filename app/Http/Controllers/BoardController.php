<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BoardController extends Controller
{
 public function index(Request $request)
{
    $user = $request->user();

    // pilih kolom roles yg aman
    $roleSelect = ['roles.id', 'roles.slug'];
    if (Schema::hasColumn('roles', 'name')) {
        $roleSelect[] = 'roles.name';
    }

    $boardsQuery = Board::query()
        ->with([
            'members:id,name,email', // batasi kolom user
            'members.roles' => fn ($q) => $q->select($roleSelect),
        ])
        ->latest('updated_at');

    // transisi: kalau sudah ada hasPermission, pakai itu; kalau belum fallback role lama
    $canManageBoards = method_exists($user, 'hasPermission')
        ? $user->hasPermission('manage_boards')
        : ($user->role === 'PM');

    // kalau bukan manager -> cuma board yang dia member
    if (!$canManageBoards) {
        $boardsQuery->whereHas('members', fn ($q) => $q->where('users.id', $user->id));
    }

    $boards = $boardsQuery->get([
        'uuid', 'squad_code', 'title', 'created_by', 'created_at', 'updated_at',
    ]);

    $users = User::query()
        ->with([
            'roles' => fn ($q) => $q->select($roleSelect),
        ])
        ->orderBy('name')
        ->get(['id', 'name', 'email']);

    return Inertia::render('Boards/Index', [
        'boards' => $boards,
        'users'  => $users,
    ]);
}

    public function show(Request $request, Board $board)
    {
        // sesuaikan relation yang kamu punya
        $board->load([
            'creator:id,name',
        ]);

        $epics = $board->epics()
            ->with('creator:id,name')
            ->latest('updated_at')
            ->get([
                'uuid',
                'board_uuid',
                'code',
                'title',
                'priority',
                'status',
                'created_by',
                'created_at',
                'updated_at',
            ]);

        // kalau kamu punya relasi members: belongsToMany(User::class, ...)
        $members = $board->members()
            ->with(['roles:id,slug,name']) // roles untuk display
            ->get(['users.id', 'users.name', 'users.email']);

        return Inertia::render('Boards/Show', [
            'board' => $board->only(['uuid', 'squad_code', 'title', 'created_at', 'updated_at']) + [
                'creator' => $board->creator,
            ],
            'epics' => $epics,
            'members' => $members,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        //  permission-first, fallback ke role enum lama
        $canCreateBoard = method_exists($user, 'hasPermission')
            ? $user->hasPermission('manage_boards')
            : ($user->role === 'PM');

        abort_unless($canCreateBoard, 403);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'squad_code' => ['nullable', 'string', 'max:50'],
            'members' => ['nullable', 'array'],
            'members.*' => ['integer', 'exists:users,id'],
        ]);

        $board = Board::create([
            'uuid' => (string) Str::uuid(),
            'squad_code' => $data['squad_code'] ?? null,
            'title' => $data['title'],
            'created_by' => $user->id,
        ]);

        // creator auto join
        $memberIds = collect($data['members'] ?? [])
            ->push($user->id)
            ->unique()
            ->values()
            ->all();

        $board->members()->syncWithoutDetaching($memberIds);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Board created.',
        ]);
    }
    public function destroy(Request $request, \App\Models\Board $board)
{
    abort_unless($request->user()?->hasPermission('deleted_boards'), 403);

    // optional: kalau board punya relasi anak, pastikan ON DELETE CASCADE / atau handle manual
    $board->delete();

    return back()->with('alert', [
        'type' => 'success',
        'message' => 'Board deleted.',
    ]);
}

}
