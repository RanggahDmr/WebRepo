<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Models\User;

class BoardController extends Controller
{
   public function index(Request $request)
{
    $user = $request->user();

    $boardsQuery = Board::query()->with(['members:id,name,role'])->latest('updated_at');

    if ($user->role !== 'PM') {
        $boardsQuery->whereHas('members', fn ($q) => $q->where('users.id', $user->id));
    }

    $boards = $boardsQuery->get(['uuid','squad_code','title','created_by','created_at','updated_at']);

    $users = $user->role === 'PM'
        ? User::query()->orderBy('name')->get(['id','name','role'])
        : collect();

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
        abort_unless($request->user()?->role === 'PM', 403);

        $data = $request->validate([
            'title' => ['required','string','max:120'],
            'squad_code' => ['nullable','string','max:50'],
            // optional: members[] dari FE (array of user_id)
            'members' => ['nullable','array'],
            'members.*' => ['integer','exists:users,id'],
        ]);

        $board = Board::create([
            'uuid' => (string) Str::uuid(),
            'squad_code' => $data['squad_code'] ?? null,
            'title' => $data['title'],
            'created_by' => $request->user()->id,
        ]);

        // creator auto join
        $memberIds = collect($data['members'] ?? [])
            ->push($request->user()->id)
            ->unique()
            ->values()
            ->all();

        // attach tanpa duplicate error
        $board->members()->syncWithoutDetaching($memberIds);

        return back()->with('success', 'Board created.');
    }
}
