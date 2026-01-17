<?php

namespace App\Http\Controllers;

use App\Models\Story;
use Inertia\Inertia;

class StoryController extends Controller
{
    public function show(Story $story)
    {
        return Inertia::render('Stories/Show', [
            'story' => $story,
        ]);
    }
}
