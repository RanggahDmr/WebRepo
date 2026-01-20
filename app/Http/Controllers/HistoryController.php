<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Inertia\Inertia;

class HistoryController extends Controller
{
    public function index()
    {
        $activities = ActivityLog::with('user')
            ->latest()
            ->limit(100)
            ->get();

        return Inertia::render('History/Index', [
            'activities' => $activities,
        ]);
    }
}
