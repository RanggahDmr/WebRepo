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
                // ===== copy global_statuses -> board_statuses =====
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
                            'position' => (int) ($gs->sort_order ?? 0),
                            'color' => $gs->color,
                            'is_done' => (bool) $gs->is_done,
                            'is_active' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }

                // ===== copy global_priorities -> board_priorities =====
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
                            'position' => (int) ($gp->sort_order ?? 0),
                            'color' => $gp->color,
                            'is_active' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]
                    );
                }
            }
        });
    }
}
