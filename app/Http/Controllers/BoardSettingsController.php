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
            'board' => $board->only(['uuid', 'title', 'created_at']),
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
            'is_done' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
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

        BoardStatus::create([
            'board_uuid' => $board->uuid,
            'scope' => $data['scope'],
            'key' => $data['key'],
            'name' => $data['name'],
            'position' => $data['position'] ?? (($nextPos ?? -1) + 1),
            'color' => $data['color'] ?? $this->randomNiceColor(),
            'is_done' => (bool)($data['is_done'] ?? false),
            'is_active' => (bool)($data['is_active'] ?? true),
        ]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Status created.',
        ]);
    }

    public function updateStatus(Request $request, Board $board, BoardStatus $status)
    {
        if ($resp = $this->ensureMember($request, $board)) return $resp;
        abort_unless($this->canManage($request), 403);

        // ensure belongs to board
        abort_unless($status->board_uuid === $board->uuid, 404);

        $data = $request->validate([
            'key' => ['sometimes', 'required', 'string', 'max:255'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'position' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'color' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_done' => ['sometimes', 'boolean'],
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
            'is_active' => ['nullable', 'boolean'],
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

        BoardPriority::create([
            'board_uuid' => $board->uuid,
            'scope' => $data['scope'],
            'key' => $data['key'],
            'name' => $data['name'],
            'level' => $data['level'] ?? 0,
            'position' => $data['position'] ?? (($nextPos ?? -1) + 1),
            'color' => $data['color'] ?? $this->randomNiceColor(),
            'is_active' => (bool)($data['is_active'] ?? true),
        ]);

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

        $data = $request->validate([
            'key' => ['sometimes', 'required', 'string', 'max:255'],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'level' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'position' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'color' => ['sometimes', 'nullable', 'string', 'max:255'],
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

        $priority->delete();

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Priority deleted.',
        ]);
    }

    private function randomNiceColor(): string
    {
        $colors = [
            '#7C3AED', '#6D28D9', '#4F46E5', '#2563EB', '#0EA5E9',
            '#06B6D4', '#10B981', '#22C55E', '#F59E0B', '#F97316',
            '#EF4444', '#F43F5E', '#EC4899',
        ];

        return $colors[array_rand($colors)];
    }
}
