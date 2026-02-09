<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateGlobalDefaultRequest;
use App\Models\GlobalDefault;
use App\Models\GlobalStatus;
use App\Models\GlobalPriority;
use Inertia\Inertia;
use Illuminate\Http\Request;

class GlobalDefaultController extends Controller
{
    public function index(Request $request)
    {
        $defaults = GlobalDefault::query()
            ->with(['defaultStatus:id,scope,key,name,color,is_done,is_active', 'defaultPriority:id,scope,key,name,color,is_active'])
            ->orderByRaw("FIELD(scope, 'EPIC', 'STORY', 'TASK')")
            ->get();

        // options for selects (active only)
        $statuses = GlobalStatus::query()
            ->where('is_active', true)
            ->orderBy('scope')
            ->orderBy('sort_order')
            ->get(['id', 'scope', 'key', 'name', 'color', 'is_done']);

        $priorities = GlobalPriority::query()
            ->where('is_active', true)
            ->orderBy('scope')
            ->orderBy('sort_order')
            ->get(['id', 'scope', 'key', 'name', 'color']);

        return Inertia::render('Admin/GlobalMasters/Defaults/Index', [
            'defaults' => $defaults,
            'statusOptions' => $statuses,
            'priorityOptions' => $priorities,
            'scopes' => ['EPIC', 'STORY', 'TASK'],
            'canManage' => $request->user()?->hasPermission('manage_global_defaults') ?? false,
        ]);
    }

    public function update(UpdateGlobalDefaultRequest $request, GlobalDefault $globalDefault)
    {
        $this->authorize('update', $globalDefault);

        $globalDefault->update([
            'default_status_id' => (int) $request->input('default_status_id'),
            'default_priority_id' => (int) $request->input('default_priority_id'),
        ]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Global default updated.',
        ]);
    }
}
