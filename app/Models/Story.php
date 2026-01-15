<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Story extends Model
{
    use HasFactory;

    protected $table = 'stories';

    protected $fillable = [
        'epic_id',
        'code',
        'title',
        'description',
        'priority',
        'status',
        'created_by',
    ];

    public function epic()
    {
        return $this->belongsTo(Epic::class, 'epic_id');
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
