<?php

namespace App\Http\Controllers;

use App\Models\GlobalPriority;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GlobalPriorityController extends Controller
{
    public function index(Request $request)
    {
        $scope = $request->query('scope', 'EPIC');
        $active = $request->query('active', '1'); // "1" | "0" | "all"

        $query = GlobalPriority::query()->where('scope', $scope);

        if ($active !== 'all') {
            $query->where('is_active', $active === '1');
        }

        $priorities = $query
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return Inertia::render('Admin/GlobalMasters/Priorities/Index', [
            'scope' => $scope,
            'active' => $active,
            'priorities' => $priorities,
            'scopes' => ['EPIC', 'STORY', 'TASK'],
            'canManage' => $request->user()?->hasPermission('manage_global_priorities') ?? false,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', GlobalPriority::class);

        $validated = $request->validate([
            'scope' => ['required', Rule::in(['EPIC', 'STORY', 'TASK'])],
            'key' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:30'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $exists = GlobalPriority::where('scope', $validated['scope'])
            ->where('key', $validated['key'])
            ->exists();

        if ($exists) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Key already exists in this scope.',
            ]);
        }

        GlobalPriority::create([
            'scope' => $validated['scope'],
            'key' => $validated['key'],
            'name' => $validated['name'],
            'color' => $validated['color'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => array_key_exists('is_active', $validated) ? (bool) $validated['is_active'] : true,
        ]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Global priority created.',
        ]);
    }

    public function update(Request $request, GlobalPriority $globalPriority)
    {
        $this->authorize('update', $globalPriority);

        $validated = $request->validate([
            'key' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:30'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        $exists = GlobalPriority::where('scope', $globalPriority->scope)
            ->where('key', $validated['key'])
            ->where('id', '!=', $globalPriority->id)
            ->exists();

        if ($exists) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Key already exists in this scope.',
            ]);
        }

        $globalPriority->update([
            'key' => $validated['key'],
            'name' => $validated['name'],
            'color' => $validated['color'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => (bool) $validated['is_active'],
        ]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Global priority updated.',
        ]);
    }

    public function destroy(GlobalPriority $globalPriority)
    {
        $this->authorize('delete', $globalPriority);

        $globalPriority->update(['is_active' => false]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Global priority deactivated.',
        ]);
    }

    public function toggleActive(GlobalPriority $globalPriority)
    {
        $this->authorize('update', $globalPriority);

        $globalPriority->update(['is_active' => !$globalPriority->is_active]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Global priority updated.',
        ]);
    }
}
