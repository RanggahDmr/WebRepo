<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Board;
use App\Services\BoardMasterSeederService;

class SeedBoardMasters extends Command
{
    protected $signature = 'boards:seed-masters {--board_uuid=}';
    protected $description = 'Seed default statuses & priorities per board';

    public function handle(BoardMasterSeederService $service): int
    {
        $boardUuid = $this->option('board_uuid');

        $query = Board::query();
        if ($boardUuid) {
            $query->where('uuid', $boardUuid);
        }

        $boards = $query->get(['uuid']);

        if ($boards->isEmpty()) {
            $this->warn('No boards found.');
            return self::SUCCESS;
        }

        $this->info("Seeding masters for {$boards->count()} board(s)...");
        foreach ($boards as $board) {
            $service->seedDefaultsForBoard($board);
            $this->line("✓ {$board->uuid}");
        }

        $this->info('Done.');
        return self::SUCCESS;
    }
}
