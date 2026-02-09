<?php

namespace App\Http\Controllers;

use App\Models\GlobalStatus;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GlobalStatusController extends Controller
{
    public function index(Request $request)
    {
        $scope = $request->query('scope', 'EPIC');
        $active = $request->query('active', '1'); // "1" | "0" | "all"

        $query = GlobalStatus::query()->where('scope', $scope);

        if ($active !== 'all') {
            $query->where('is_active', $active === '1');
        }

        $statuses = $query
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('Admin/GlobalMasters/Statuses/Index', [
            'scope' => $scope,
            'active' => $active,
            'statuses' => $statuses,
            'scopes' => ['EPIC', 'STORY', 'TASK'],
            'canManage' => $request->user()?->hasPermission('manage_global_statuses') ?? false,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', GlobalStatus::class);

        $validated = $request->validate([
            'scope' => ['required', Rule::in(['EPIC', 'STORY', 'TASK'])],
            'key' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:30'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_done' => ['required', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        // enforce uniqueness per scope for key
        $exists = GlobalStatus::where('scope', $validated['scope'])
            ->where('key', $validated['key'])
            ->exists();

        if ($exists) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Key already exists in this scope.',
            ]);
        }

        GlobalStatus::create([
            'scope' => $validated['scope'],
            'key' => $validated['key'],
            'name' => $validated['name'],
            'color' => $validated['color'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_done' => (bool) $validated['is_done'],
            'is_active' => array_key_exists('is_active', $validated) ? (bool) $validated['is_active'] : true,
        ]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Global status created.',
        ]);
    }

    public function update(Request $request, GlobalStatus $globalStatus)
    {
        $this->authorize('update', $globalStatus);

        $validated = $request->validate([
            'key' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:30'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_done' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ]);

        // prevent duplicate key within same scope (ignore current id)
        $exists = GlobalStatus::where('scope', $globalStatus->scope)
            ->where('key', $validated['key'])
            ->where('id', '!=', $globalStatus->id)
            ->exists();

        if ($exists) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Key already exists in this scope.',
            ]);
        }

        $globalStatus->update([
            'key' => $validated['key'],
            'name' => $validated['name'],
            'color' => $validated['color'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_done' => (bool) $validated['is_done'],
            'is_active' => (bool) $validated['is_active'],
        ]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Global status updated.',
        ]);
    }

    // delete = deactivate (opsi A)
    public function destroy(GlobalStatus $globalStatus)
    {
        $this->authorize('delete', $globalStatus);

        $globalStatus->update(['is_active' => false]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Global status deactivated.',
        ]);
    }

    // optional: quick toggle active
    public function toggleActive(GlobalStatus $globalStatus)
    {
        $this->authorize('update', $globalStatus);

        $globalStatus->update(['is_active' => !$globalStatus->is_active]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Global status updated.',
        ]);
    }
}
