<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\Epic;
use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use App\Support\UniqueCode;


class EpicPageController extends Controller
{
    public function index(Board $board)
    {
             abort_unless(
    $board->members()->where('users.id', request()->user()->id)->exists(),
    403
);
        $epics = Epic::with('creator')
            ->where('board_uuid', $board->uuid)
            ->latest('updated_at')
            ->get([
                'uuid',
                'board_uuid',
                'code',
                'title',
                
                'priority',
                'description',
                'status',
                'created_by',
                'created_at',
                'updated_at',
            ]);

        return Inertia::render('Dashboard/Index', [
            'board' => $board->only(['uuid', 'squad_code', 'title', 'created_at']),
            'epics' => $epics,
        ]);
   

    }

    public function show(Epic $epic)
    {
        $epic->load(['creator', 'board']);

        $stories = Story::with('creator')
            ->where('epic_uuid', $epic->uuid)
            ->latest('updated_at')
            ->get([
                'uuid',
                'epic_uuid',
                'code',
                'title',
                'description',
                'priority',
                'status',
                'created_by',
                'created_at',
                'updated_at',
            ]);

        return Inertia::render('Epics/Show', [
            'board' => $epic->board?->only(['uuid', 'squad_code', 'title', 'created_at']),
            'epic' => $epic->only([
                'uuid',
                'board_uuid',
                'code',
                'title',
                
                'description',
                'priority',
                'status',
                'created_by',
                'created_at',
                'updated_at',
            ]) + ['creator' => $epic->creator],
            'stories' => $stories,
        ]);
    }

    // PM only
    public function store(Request $request, Board $board)
    {
        abort_unless($request->user()?->role === 'PM', 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
           
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'in:LOW,MEDIUM,HIGH'],
            'status' => ['required', 'in:TODO,IN_PROGRESS,DONE'],
        ]);

        Epic::create([
            'uuid' => (string) Str::uuid(),
            'board_uuid' => $board->uuid,
            'code' => UniqueCode::epic(),
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            
            'priority' => $validated['priority'],
            'status' => $validated['status'],
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('epics.index', $board);
    }

    public function update(Request $request, Epic $epic)
    {
        $validated = $request->validate([
            'code' => ['sometimes', 'nullable', 'string', 'max:30', 'unique:epics,code,' . $epic->uuid . ',uuid'],
            'title' => ['sometimes', 'string', 'max:255'],
           
            'priority' => ['sometimes', 'in:LOW,MEDIUM,HIGH'],
            'status' => ['sometimes', 'in:TODO,IN_PROGRESS,DONE'],
        ]);

        if (empty($validated)) {
            return back();
        }

        $epic->update($validated);

        return back()->with('success', 'Epic updated');
    }

    public function storeStory(Request $request, Epic $epic)
    {
        abort_unless(in_array($request->user()->role, ['PM', 'SAD']), 403);

        return DB::transaction(function () use ($request, $epic) {
            $validated = $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'priority' => ['required', 'in:LOW,MEDIUM,HIGH'],
                'status' => ['required', 'in:TODO,IN_PROGRESS,DONE'],
            ]);

            $exists = Story::where('epic_uuid', $epic->uuid)
                ->where('title', $validated['title'])
                ->exists();

            if ($exists) {
                return redirect()
                    ->route('epics.show', $epic)
                    ->with('warning', 'Story already exists');
            }

            Story::create([
                'uuid' => (string) Str::uuid(),
                'code' => UniqueCode::story(),
                'epic_uuid' => $epic->uuid,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'priority' => $validated['priority'],
                'status' => $validated['status'],
                'created_by' => auth()->id(),
            ]);

            return redirect()
                ->route('epics.show', $epic)
                ->with('success', 'Story created');
        });
    }

    public function updateStory(Request $request, Story $story)
    {
        abort_unless($request->user()->role === 'PM', 403);

        $validated = $request->validate([
            'code' => ['sometimes', 'nullable', 'string', 'max:30', 'unique:stories,code,' . $story->uuid . ',uuid'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'priority' => ['sometimes', 'in:LOW,MEDIUM,HIGH'],
            'status' => ['sometimes', 'in:TODO,IN_PROGRESS,DONE'],
        ]);

        if (empty($validated)) {
            return back();
        }

        $story->update($validated);

        return redirect()
            ->route('epics.show', $story->epic)
            ->with('success', 'Story updated');
    }
}
