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

        // ✅ Tentukan kolom roles yang benar (biar gak error "roles.name not found")
        $roleSelect = ['roles.id', 'roles.slug'];
        if (Schema::hasColumn('roles', 'name')) {
            $roleSelect[] = 'roles.name';
        }

        $boardsQuery = Board::query()
            ->with([
                // member basic (role enum lama masih boleh ada)
                'members:id,name,role',

                // roles relationship (pivot user_roles)
                'members.roles' => fn ($q) => $q->select($roleSelect),
            ])
            ->latest('updated_at');

        // ✅ Transisi: kalau sudah ada permission system, pakai itu
        $canManageBoards = method_exists($user, 'hasPermission')
            ? $user->hasPermission('manage_boards')
            : ($user->role === 'PM');

        // kalau tidak boleh manage boards -> cuma lihat board yg dia member
        if (!$canManageBoards) {
            $boardsQuery->whereHas('members', fn ($q) => $q->where('users.id', $user->id));
        }

        $boards = $boardsQuery->get([
            'uuid', 'squad_code', 'title', 'created_by', 'created_at', 'updated_at',
        ]);

        $usersQuery = User::query()
            ->with([
                'roles' => fn ($q) => $q->select($roleSelect),
            ])
            ->orderBy('name');

        $users = $usersQuery->get(['id', 'name', 'email']);

        return Inertia::render('Boards/Index', [
            'boards' => $boards,
            'users'  => $users,
        ]);
    }

    public function show(Board $board)
    {
        return redirect()->route('epics.index', $board);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // ✅ permission-first, fallback ke role enum lama
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
    abort_unless($request->user()?->hasPermission('manage_boards'), 403);

    // optional: kalau board punya relasi anak, pastikan ON DELETE CASCADE / atau handle manual
    $board->delete();

    return back()->with('alert', [
        'type' => 'success',
        'message' => 'Board deleted.',
    ]);
}

}
