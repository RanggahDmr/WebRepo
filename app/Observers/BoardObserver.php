<?php

namespace App\Observers;

use App\Models\Board;
use App\Models\BoardStatus;
use App\Models\BoardPriority;
use Illuminate\Support\Facades\DB;

class BoardObserver
{
    public function created(Board $board): void
    {
        DB::transaction(function () use ($board) {
            $scopes = ['EPIC', 'STORY', 'TASK'];

            foreach ($scopes as $scope) {
                // copy statuses
                $gStatuses = DB::table('global_statuses')
                    ->where('scope', $scope)
                    ->where('is_active', 1)
                    ->orderBy('sort_order')
                    ->get(['key', 'name', 'color', 'sort_order', 'is_done']);

                foreach ($gStatuses as $gs) {
                    BoardStatus::firstOrCreate(
                        [
                            'board_uuid' => $board->uuid,
                            'scope' => $scope,
                            'key' => $gs->key,
                        ],
                        [
                            'name' => $gs->name,
                            'color' => $gs->color,
                            'position' => (int) ($gs->sort_order ?? 0),
                            'is_done' => (bool) $gs->is_done,
                            'is_active' => true,
                        ]
                    );
                }

                // copy priorities
                $gPriorities = DB::table('global_priorities')
                    ->where('scope', $scope)
                    ->where('is_active', 1)
                    ->orderBy('sort_order')
                    ->get(['key', 'name', 'color', 'sort_order']);

                foreach ($gPriorities as $gp) {
                    BoardPriority::firstOrCreate(
                        [
                            'board_uuid' => $board->uuid,
                            'scope' => $scope,
                            'key' => $gp->key,
                        ],
                        [
                            'name' => $gp->name,
                            'color' => $gp->color,
                            'position' => (int) ($gp->sort_order ?? 0),
                            'level' => 0,       // kalau kolom ada
                            'is_active' => true,
                        ]
                    );
                }
            }
        });
    }
}
