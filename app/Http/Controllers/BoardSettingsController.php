<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\BoardStatus;
use App\Models\BoardPriority;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BoardSettingsController extends Controller
{
    private array $scopes = ['EPIC', 'STORY', 'TASK'];

    private function ensureMember(Request $request, Board $board)
    {
        $user = $request->user();

        $isMember = $board->members()
            ->where('users.id', $user->id)
            ->exists();

        if (!$isMember) {
            $message = "You don't have access to this board.";

            if ($request->header('X-Inertia')) {
                abort(403, $message);
            }

            return redirect()->route('boards.index')->with('alert', [
                'type' => 'error',
                'message' => $message,
            ]);
        }

        return null;
    }

    private function canManage(Request $request): bool
    {
        $user = $request->user();
        return method_exists($user, 'hasPermission') && $user->hasPermission('manage_board_settings');
    }

    public function index(Request $request, Board $board)
    {
        if ($resp = $this->ensureMember($request, $board)) return $resp;

        $canManage = $this->canManage($request);

        $statuses = BoardStatus::query()
            ->where('board_uuid', $board->uuid)
            ->orderBy('scope')
            ->orderBy('position')
            ->get();

        $priorities = BoardPriority::query()
            ->where('board_uuid', $board->uuid)
            ->orderBy('scope')
            ->orderBy('position')
            ->get();

        return Inertia::render('Boards/Settings', [
            'board' => $board->only(['uuid', 'title',  'created_at']),
            'canManageSettings' => $canManage,
            'scopes' => $this->scopes,
            'statuses' => $statuses,
            'priorities' => $priorities,
        ]);
    }

    // =========================
    // STATUSES
    // =========================
    public function storeStatus(Request $request, Board $board)
    {
        if ($resp = $this->ensureMember($request, $board)) return $resp;
        abort_unless($this->canManage($request), 403);

        $data = $request->validate([
            'scope' => ['required', 'in:EPIC,STORY,TASK'],
            'key' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'position' => ['nullable', 'integer', 'min:0'],
            'color' => ['nullable', 'string', 'max:255'],

            'is_default' => ['boolean'],
            'is_done' => ['boolean'],
            'is_locked' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        // unique per board+scope+key
        $exists = BoardStatus::query()
            ->where('board_uuid', $board->uuid)
            ->where('scope', $data['scope'])
            ->where('key', $data['key'])
            ->exists();

        if ($exists) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Status key already exists for this scope.',
            ]);
        }

        $nextPos = BoardStatus::query()
            ->where('board_uuid', $board->uuid)
            ->where('scope', $data['scope'])
            ->max('position');

        $status = BoardStatus::create([
            'board_uuid' => $board->uuid,
            'scope' => $data['scope'],
            'key' => $data['key'],
            'name' => $data['name'],
            'position' => $data['position'] ?? (($nextPos ?? -1) + 1),
             'color' => $data['color'] ?? $this->randomNiceColor(),
            'is_default' => (bool)($data['is_default'] ?? false),
            'is_done' => (bool)($data['is_done'] ?? false),
            'is_locked' => (bool)($data['is_locked'] ?? false),
            'is_active' => (bool)($data['is_active'] ?? true),
        ]);

        // ensure single default per scope
        if ($status->is_default) {
            BoardStatus::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $status->scope)
                ->where('id', '!=', $status->id)
                ->update(['is_default' => false]);
        }

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Status created.',
        ]);
    }

    public function updateStatus(Request $request, Board $board, BoardStatus $status)
    {
        if ($resp = $this->ensureMember($request, $board)) return $resp;
        abort_unless($this->canManage($request), 403);

        // security: ensure belongs to board
        abort_unless($status->board_uuid === $board->uuid, 404);

        if ($status->is_locked) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'This status is locked.',
            ]);
        }

        $data = $request->validate([
            'key' => ['sometimes', 'required', 'string', 'max:255'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'position' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'color' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_default' => ['sometimes', 'boolean'],
            'is_done' => ['sometimes', 'boolean'],
            'is_locked' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        // prevent key duplication if key changed
        if (array_key_exists('key', $data) && $data['key'] !== $status->key) {
            $exists = BoardStatus::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $status->scope)
                ->where('key', $data['key'])
                ->exists();

            if ($exists) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => 'Status key already exists for this scope.',
                ]);
            }
        }

        $status->update($data);

        if (array_key_exists('is_default', $data) && $data['is_default']) {
            BoardStatus::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $status->scope)
                ->where('id', '!=', $status->id)
                ->update(['is_default' => false]);
        }

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Status updated.',
        ]);
    }

    public function destroyStatus(Request $request, Board $board, BoardStatus $status)
    {
        if ($resp = $this->ensureMember($request, $board)) return $resp;
        abort_unless($this->canManage($request), 403);

        abort_unless($status->board_uuid === $board->uuid, 404);

        if ($status->is_locked) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'This status is locked.',
            ]);
        }

        $status->delete();

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Status deleted.',
        ]);
    }

    // =========================
    // PRIORITIES
    // =========================
    public function storePriority(Request $request, Board $board)
    {
        if ($resp = $this->ensureMember($request, $board)) return $resp;
        abort_unless($this->canManage($request), 403);

        $data = $request->validate([
            'scope' => ['required', 'in:EPIC,STORY,TASK'],
            'key' => ['required', 'string', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'level' => ['nullable', 'integer', 'min:0'],
            'position' => ['nullable', 'integer', 'min:0'],
            'color' => ['nullable', 'string', 'max:255'],
     
            'is_active' => ['boolean'],
        ]);

        $exists = BoardPriority::query()
            ->where('board_uuid', $board->uuid)
            ->where('scope', $data['scope'])
            ->where('key', $data['key'])
            ->exists();

        if ($exists) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Priority key already exists for this scope.',
            ]);
        }

        $nextPos = BoardPriority::query()
            ->where('board_uuid', $board->uuid)
            ->where('scope', $data['scope'])
            ->max('position');

        $prio = BoardPriority::create([
            'board_uuid' => $board->uuid,
            'scope' => $data['scope'],
            'key' => $data['key'],
            'name' => $data['name'],
            'level' => $data['level'] ?? 0,
            'position' => $data['position'] ?? (($nextPos ?? -1) + 1),
             'color' => $data['color'] ?? $this->randomNiceColor(),
        
            'is_active' => (bool)($data['is_active'] ?? true),
        ]);

        if ($prio->is_default) {
            BoardPriority::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $prio->scope)
                ->where('id', '!=', $prio->id)
                ->update(['is_default' => false]);
        }

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Priority created.',
        ]);
    }

    public function updatePriority(Request $request, Board $board, BoardPriority $priority)
    {
        if ($resp = $this->ensureMember($request, $board)) return $resp;
        abort_unless($this->canManage($request), 403);

        abort_unless($priority->board_uuid === $board->uuid, 404);

        if ($priority->is_locked) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'This priority is locked.',
            ]);
        }

        $data = $request->validate([
            'key' => ['sometimes', 'required', 'string', 'max:255'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'level' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'position' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'color' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_default' => ['sometimes', 'boolean'],
            'is_locked' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if (array_key_exists('key', $data) && $data['key'] !== $priority->key) {
            $exists = BoardPriority::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $priority->scope)
                ->where('key', $data['key'])
                ->exists();

            if ($exists) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => 'Priority key already exists for this scope.',
                ]);
            }
        }

        $priority->update($data);

        if (array_key_exists('is_default', $data) && $data['is_default']) {
            BoardPriority::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $priority->scope)
                ->where('id', '!=', $priority->id)
                ->update(['is_default' => false]);
        }

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Priority updated.',
        ]);
    }

    public function destroyPriority(Request $request, Board $board, BoardPriority $priority)
    {
        if ($resp = $this->ensureMember($request, $board)) return $resp;
        abort_unless($this->canManage($request), 403);

        abort_unless($priority->board_uuid === $board->uuid, 404);

        if ($priority->is_locked) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'This priority is locked.',
            ]);
        }

        $priority->delete();

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Priority deleted.',
        ]);
    }
    private function randomNiceColor(): string
{
    // Vibrant palette (no gray)
    $colors = [
        '#7C3AED', // violet
        '#6D28D9', // deep violet
        '#4F46E5', // indigo
        '#2563EB', // blue
        '#0EA5E9', // sky
        '#06B6D4', // cyan
        '#10B981', // emerald
        '#22C55E', // green
        '#F59E0B', // amber
        '#F97316', // orange
        '#EF4444', // red
        '#F43F5E', // rose
        '#EC4899', // pink
    ];

    return $colors[array_rand($colors)];
}


}
