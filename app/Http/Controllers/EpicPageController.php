<?php
namespace App\Http\Controllers;

use App\Models\Epic;
use App\Models\Story;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Board;



class EpicPageController extends Controller
{
   public function index(Board $board)
{
    $epics = Epic::with('creator')
        ->where('board_id', $board->id)
        ->latest('updated_at')
        ->get([
            'id',
            'board_id',
            'code',
            'create_work',
            'priority',
            'description',
            'status',
            'created_by',
            'created_at',
            'updated_at',
        ]);

    return Inertia::render('Dashboard/Index', [
        'board' => $board->only(['id', 'squad', 'title', 'created_at']),

        'epics' => $epics,
    ]);
}


    public function show(Epic $epic)
    {
        $epic->load(['creator', 'board']); 
       $stories = Story::with('creator') 
        ->where('epic_id', $epic->id)
        ->latest('updated_at')
        ->get([
            'id',
            'epic_id',
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
        'board' => $epic->board?->only(['id','squad','title', 'created_at']),
        'epic' => $epic->load('creator')->only([
            'id',
            'code',
            'create_work',
            'description',
            'priority',
            'status',
            'created_by',
            'created_at',
            'updated_at',
            'creator',
        ]),
        'stories' => $stories,
    ]);
    }

    // PM only (route middleware role:PM)
    public function store(Request $request, Board $board)
{
    abort_unless($request->user()?->role === 'PM', 403);

    $validated = $request->validate([
        'description' => ['nullable', 'string'],
        'create_work' => ['required','string','max:255'],
        'priority' => ['required','in:LOW,MEDIUM,HIGH'],
        'status' => ['required','in:TODO,IN_PROGRESS,DONE'],
    ]);

    $epic = Epic::create([
        'board_id' => $board->id,
        'code' => 'EP-' . strtoupper(Str::random(6)),
        'description' => $validated['description'] ?? null,
        'create_work' => $validated['create_work'],
        'priority' => $validated['priority'],
        'status' => $validated['status'],
        'created_by' => auth()->id(),
    ]);

    $epic->update([
        'code' => 'EP-' . str_pad($epic->id, 5, '0', STR_PAD_LEFT),
    ]);

    return redirect()->route('epics.index', $board);

    logger('EPIC STORE HIT', [
  'board_param' => $board?->id,
  'board_squad' => $board?->squad,
]);

}


    // PM only (route middleware role:PM)
   public function update(Request $request, Epic $epic)
{
    $validated = $request->validate([
        'code' => ['sometimes','nullable','string','max:30','unique:epics,code,' . $epic->id],
        'create_work' => ['sometimes','string','max:255'],
        'priority' => ['sometimes','in:LOW,MEDIUM,HIGH'],
        'status' => ['sometimes','in:TODO,IN_PROGRESS,DONE'],
    ]);

    // safety
    if (empty($validated)) {
        return back();
    }

    $epic->update($validated);

    return back()->with('success', 'Epic updated');
}


public function storeStory(Request $request, Epic $epic)
{
    abort_unless(
    in_array($request->user()->role, ['PM', 'SAD']),
    403
    );

    return DB::transaction(function () use ($request, $epic) {

        $validated = $request->validate([
            'title' => ['required','string','max:255'],
            'description' => ['nullable','string'],
            'priority' => ['required','in:LOW,MEDIUM,HIGH'],
            'status' => ['required','in:TODO,IN_PROGRESS,DONE'],
        ]);

       
        $exists = Story::where('epic_id', $epic->id)
            ->where('title', $validated['title'])
            ->exists();

        if ($exists) {
            return redirect()
                ->route('epics.show', ['epic' => $epic->code])
                ->with('warning', 'Story already exists');
        }

      
        $story = Story::create([
              'code' => 'ST-' . strtoupper(Str::random(6)),
                'epic_id' => $epic->id,
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'priority' => $validated['priority'],
                'status' => $validated['status'],
                'created_by' => auth()->id(),
        ]);

      
        $story->update([
            'code' => 'ST-' . str_pad($story->id, 5, '0', STR_PAD_LEFT),
        ]);

        return redirect()
            ->route('epics.show', ['epic' => $epic->code])
            ->with('success', 'Story created');
    });
}

public function updateStory(Request $request, Story $story)
{
    abort_unless($request->user()->role === 'PM', 403);

    $validated = $request->validate([
        'code' => ['sometimes', 'nullable', 'string', 'max:30', 'unique:stories,code,' . $story->id],
        'title' => ['sometimes', 'string', 'max:255'],
        'description' => ['sometimes', 'nullable', 'string'],
        'priority' => ['sometimes', 'in:LOW,MEDIUM,HIGH'],
        'status' => ['sometimes', 'in:TODO,IN_PROGRESS,DONE'],
    ]);

    $story->update($validated);

    return redirect()
->route('epics.show', [ 'epic' => $story->epic->code ])
        ->with('success', 'Story updated');
}

}
