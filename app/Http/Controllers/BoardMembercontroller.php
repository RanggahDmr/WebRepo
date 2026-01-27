<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\User;
use Illuminate\Http\Request;

class BoardMemberController extends Controller
{
    public function store(Request $request, Board $board)
    {
        abort_unless($request->user()?->role === 'PM', 403);

        $data = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
        ]);

        $board->members()->syncWithoutDetaching([$data['user_id']]);

        return back()->with('success', 'Member added.');
    }

    public function destroy(Request $request, Board $board, User $user)
    {
        abort_unless($request->user()?->role === 'PM', 403);

        // optional: cegah remove diri sendiri (PM)
        if ($user->id === $request->user()->id) {
            return back()->with('error', 'You cannot remove yourself.');
        }

        $board->members()->detach($user->id);

        return back()->with('success', 'Member removed.');
    }
}
