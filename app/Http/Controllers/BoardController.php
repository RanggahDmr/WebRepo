<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class BoardController extends Controller
{
    public function index()
    {
        $boards = Board::query()
            ->latest('updated_at')
            ->get(['uuid','squad_code','title','created_by','created_at','updated_at']);

        return Inertia::render('Boards/Index', [
            'boards' => $boards,
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
            'squad_code' => ['nullable','string','max:50'], // optional input
        ]);

        Board::create([
            'uuid' => (string) Str::uuid(),
            'squad_code' => $data['squad_code'] ?? null,
            'title' => $data['title'],
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Board created.');
    }
}
