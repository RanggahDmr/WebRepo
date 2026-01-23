<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Epic;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BoardController extends Controller
{
    public function index()
    {
        $boards = Board::query()
            ->latest('updated_at')
            ->get(['id','squad','title','created_by','created_at','updated_at']);

        return Inertia::render('Boards/Index', [
            'boards' => $boards,
        ]);
    }

    public function show(Board $board)
    {
        $epics = Epic::query()
            ->where('board_id', $board->id)
            ->latest('updated_at')
            ->get();

        return redirect()->route('epics.index', $board);
        
    }

    public function store(Request $request)
{
    abort_unless($request->user()?->role === 'PM', 403);

    $data = $request->validate([
        'title' => ['required','string','max:120'],
        'squad' => (string) Str::uuid(),
    ]);

    

    Board::create([
        'squad' => $code,
        'title' => $data['title'],
        'created_by' => $request->user()->id,
    ]);

    return back()->with('success', 'Board created.');
}
}
