<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use App\Services\BoardMasterSeeder;

class BoardController extends Controller
{
public function index(Request $request)
{
    $user = $request->user();

    // pilih kolom roles yg aman (karena roles.name kadang tidak ada)
    $roleSelect = ['roles.id', 'roles.slug'];
    if (Schema::hasColumn('roles', 'name')) {
        $roleSelect[] = 'roles.name';
    }

    $boards = Board::query()
        ->with([
            'members:id,name,email',
            'members.roles' => fn ($q) => $q->select($roleSelect),
        ])
        //  SELALU filter by membership (semua user)
        ->whereHas('members', fn ($q) => $q->where('users.id', $user->id))
        ->latest('updated_at')
        ->get(['uuid','squad_code','title','created_by','created_at','updated_at']);

    $users = User::query()
        ->with(['roles' => fn ($q) => $q->select($roleSelect)])
        ->orderBy('name')
        ->get(['id','name','email']);

    return Inertia::render('Boards/Index', [
        'boards' => $boards,
        'users'  => $users,
    ]);
}


    public function show(Request $request, Board $board)
    {
        // sesuaikan relation yang kamu punya
         $user = $request->user();

    $isMember = $board->members()->where('users.id', $user->id)->exists();
    if (!$isMember) {
        $message = "You don't have access to this board.";

        if ($request->header('X-Inertia')) abort(403, $message);

        return redirect()
            ->route('dashboard')
            ->with('alert', [
                'type' => 'error',
                'message' => $message,
            ]);
    }
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
       $canCreateBoard = $user?->hasPermission('manage_boards') ?? false;

        abort_unless($canCreateBoard, 403);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:120'],
            'squad_code' => ['nullable', 'string', 'max:50'],
            'members' => ['nullable', 'array'],
            'members.*' => ['integer', 'exists:users,id'],
        ]);
        DB::transaction(function () use ($data, $user, &$board)
        {
        $board = Board::create([
            'uuid' => (string) Str::uuid(),
            'squad_code' => $data['squad_code'] ?? null,
            'title' => $data['title'],
            'created_by' => $user->id,
        ]);
        $memberIds = collect($data['members'] ?? [])
            ->push($user->id)
            ->unique()
            ->values()
            ->all();

        $board->members()->syncWithoutDetaching($memberIds);

        $masterSeeder->seedDefaultsForBoard($board);

        return $board;
        });
     
        // creator auto join
        

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
