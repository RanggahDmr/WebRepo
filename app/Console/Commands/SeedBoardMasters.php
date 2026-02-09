<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Models\Board;
use App\Models\BoardStatus;
use App\Models\BoardPriority;

class SeedBoardMasters extends Command
{
    protected $signature = 'seed:board-masters {board_uuid?}';
    protected $description = 'Copy global statuses/priorities into board masters for a board (or all boards).';

    public function handle(): int
    {
        $boardUuid = $this->argument('board_uuid');

        $boards = $boardUuid
            ? Board::query()->where('uuid', $boardUuid)->get()
            : Board::all(['uuid']);

        if ($boards->isEmpty()) {
            $this->error('No boards found.');
            return self::FAILURE;
        }

        $scopes = ['EPIC', 'STORY', 'TASK'];

        foreach ($boards as $board) {
            DB::transaction(function () use ($board, $scopes) {
                foreach ($scopes as $scope) {
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

            $this->info("Seeded masters for board: {$board->uuid}");
        }

        return self::SUCCESS;
    }
}
