<?php

namespace App\Http\Controllers;

use App\Models\Epic;
use App\Models\Story;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EpicPageController extends Controller
{
    public function index()
    {
        $epics = Epic::query()
            ->latest('updated_at')
            ->get(['id','code','create_work','priority','status','created_by','created_at','updated_at']);

        return Inertia::render('dashboard', [
            'epics' => $epics,
        ]);
    }

    public function show(Epic $epic)
    {
        $stories = Story::query()
            ->where('epic_id', $epic->id)
            ->latest('updated_at')
            ->get(['id','epic_id','code','title','description','priority','status','created_by','created_at','updated_at']);

        return Inertia::render('Epics/Show', [
            'epic' => $epic->only(['id','code','create_work','priority','status','created_by','created_at','updated_at']),
            'stories' => $stories,
        ]);
    }

    // PM only (route middleware role:PM)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['nullable','string','max:30','unique:epics,code'],
            'create_work' => ['required','string','max:255'],
            'priority' => ['required','in:LOW,MEDIUM,HIGH'],
            'status' => ['required','in:TODO,IN_PROGRESS,DONE'],
        ]);

        Epic::create([
            'code' => $validated['code'] ?? null,
            'create_work' => $validated['create_work'],
            'priority' => $validated['priority'],
            'status' => $validated['status'],
            'created_by' => $request->user()->id,
        ]);

        return redirect()->route('dashboard');
    }

    // PM only (route middleware role:PM)
    public function update(Request $request, Epic $epic)
    {
        $validated = $request->validate([
            'code' => ['nullable','string','max:30','unique:epics,code,' . $epic->id],
            'create_work' => ['required','string','max:255'],
            'priority' => ['required','in:LOW,MEDIUM,HIGH'],
            'status' => ['required','in:TODO,IN_PROGRESS,DONE'],
        ]);

        $epic->update([
            'code' => $validated['code'] ?? null,
            'create_work' => $validated['create_work'],
            'priority' => $validated['priority'],
            'status' => $validated['status'],
        ]);

        return redirect()->route('dashboard')->with('success', 'Epic updated');
    }

    public function storeStory(Request $request, Epic $epic)
{
    abort_unless($request->user()->role === 'PM', 403);

    $validated = $request->validate([
        'code' => ['nullable','string','max:30','unique:stories,code'],
        'title' => ['required','string','max:255'],
        'description' => ['nullable','string'],
        'priority' => ['required','in:LOW,MEDIUM,HIGH'],
        'status' => ['required','in:TODO,IN_PROGRESS,DONE'],
    ]);

    Story::create([
        'epic_id' => $epic->id,
        'code' => $validated['code'] ?? null,
        'title' => $validated['title'],
        'description' => $validated['description'] ?? null,
        'priority' => $validated['priority'],
        'status' => $validated['status'],
        'created_by' => $request->user()->id,
    ]);

    return redirect()->route('epics.show', $epic->id)->with('success', 'Story created');
}

public function updateStory(Request $request, Story $story)
{
    abort_unless($request->user()->role === 'PM', 403);

    $validated = $request->validate([
        'code' => ['nullable','string','max:30','unique:stories,code,' . $story->id],
        'title' => ['required','string','max:255'],
        'description' => ['nullable','string'],
        'priority' => ['required','in:LOW,MEDIUM,HIGH'],
        'status' => ['required','in:TODO,IN_PROGRESS,DONE'],
    ]);

    $story->update([
        'code' => $validated['code'] ?? null,
        'title' => $validated['title'],
        'description' => $validated['description'] ?? null,
        'priority' => $validated['priority'],
        'status' => $validated['status'],
    ]);

    return redirect()->route('epics.show', $story->epic_id)->with('success', 'Story updated');
}

}
