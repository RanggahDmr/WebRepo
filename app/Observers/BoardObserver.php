<?php

namespace App\Observers;

use App\Models\Board;
use Illuminate\Support\Facades\DB;

class BoardObserver
{
    public function created(Board $board): void
    {
        DB::transaction(function () use ($board) {

            /**
             *  NEW RULE:
             * - Board tidak lagi punya master status/priority sendiri.
             * - Default status/priority diambil dari global_defaults per scope.
             * - Jadi saat board dibuat, tidak perlu seed apa pun ke board_statuses/board_priorities.
             */

            // (Opsional) Auto-add creator sebagai member board
            // Sesuaikan kalau struktur pivot board_members kamu beda.
            // Kalau BoardController kamu sudah handle ini, boleh hapus blok ini.
            if (!empty($board->created_by)) {
                $exists = $board->members()
                    ->where('users.id', $board->created_by)
                    ->exists();

                if (!$exists) {
                    $board->members()->attach($board->created_by, [
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });
    }
}
