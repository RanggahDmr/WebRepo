<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\User;
use Illuminate\Http\Request;
use App\Support\BoardAccess;

class BoardMemberController extends Controller
{
    public function store(Request $request, Board $board)
    {
        $actor = $request->user();

        // harus bisa akses board (member / atau bypass sesuai BoardAccess)
        abort_unless(BoardAccess::canAccess($actor, $board), 403);

        // RBAC permission (no hardcode role)
        abort_unless($actor?->hasPermission('manage_members'), 403);

        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $board->members()->syncWithoutDetaching([$data['user_id']]);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Member added.',
        ]);
    }

    public function destroy(Request $request, Board $board, User $user)
    {
        $actor = $request->user();

        abort_unless(BoardAccess::canAccess($actor, $board), 403);
        abort_unless($actor?->hasPermission('manage_members'), 403);

        // optional: cegah remove diri sendiri
        if ($user->id === $actor->id) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'You cannot remove yourself.',
            ]);
        }

        $board->members()->detach($user->id);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Member removed.',
        ]);
    }
}
