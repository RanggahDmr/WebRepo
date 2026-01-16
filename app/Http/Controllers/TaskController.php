<?php

namespace App\Http\Controllers;

use App\Models\Story;
use Inertia\Inertia;

class TaskController extends Controller
{
    public function index(Story $story)
    {
        return Inertia::render('Tasks/TaskBoard', [
            'story' => $story,
            'tasks' => $story->tasks()->get(),
        ]);
    }
}
