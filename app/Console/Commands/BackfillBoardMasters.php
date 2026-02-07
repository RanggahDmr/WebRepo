<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Board;
use App\Services\BoardMasterSeederService;

class BackfillBoardMasters extends Command
{
    protected $signature = 'board:backfill-masters {--board=}';
    protected $description = 'Seed default statuses/priorities for boards (per scope)';

    public function handle(BoardMasterSeederService $seeder): int
    {
        $q = Board::query()->orderBy('uuid');

        if ($uuid = $this->option('board')) {
            $q->where('uuid', $uuid);
        }

        $count = 0;

        $q->chunk(50, function ($boards) use ($seeder, &$count) {
            foreach ($boards as $board) {
                $seeder->seedDefaultsForBoard($board);
                $count++;
                $this->info("Seeded masters for board: {$board->uuid}");
            }
        });

        $this->info("Done. Total boards processed: {$count}");
        return self::SUCCESS;
    }
}
