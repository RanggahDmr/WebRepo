<?php

namespace App\Services;

use App\Models\Board;
use App\Models\BoardStatus;
use App\Models\BoardPriority;
use Illuminate\Support\Facades\DB;

class BoardMasterSeederService
{
    public function seedDefaultsForBoard(Board $board): void
    {
        DB::transaction(function () use ($board) {
            $this->seedStatuses($board);
            $this->seedPriorities($board);

            $this->ensureSingleDefaultStatusPerScope($board);
            $this->ensureSingleDefaultPriorityPerScope($board);
        });
    }

    private function seedStatuses(Board $board): void
    {
        $defaults = config('board_masters.statuses', []);

        foreach ($defaults as $scope => $items) {
            foreach ($items as $item) {
                BoardStatus::updateOrCreate(
                    [
                        'board_uuid' => $board->uuid,
                        'scope'      => $scope,
                        'key'        => $item['key'],
                    ],
                    [
                        //  IMPORTANT: pakai `name` (bukan label)
                        'name'       => $item['name'] ?? $item['label'] ?? $item['key'],
                        'position'   => (int)($item['position'] ?? 0),
                        'color'      => $item['color'] ?? null,
                        'is_active'  => (bool)($item['is_active'] ?? true),
                        'is_default' => (bool)($item['is_default'] ?? false),
                        'is_done'    => (bool)($item['is_done'] ?? false),
                    ]
                );
            }
        }
    }

    private function seedPriorities(Board $board): void
    {
        $defaults = config('board_masters.priorities', []);

        foreach ($defaults as $scope => $items) {
            foreach ($items as $item) {
                BoardPriority::updateOrCreate(
                    [
                        'board_uuid' => $board->uuid,
                        'scope'      => $scope,
                        'key'        => $item['key'],
                    ],
                    [
                        //  IMPORTANT: pakai `name` (bukan label)
                        'name'       => $item['name'] ?? $item['label'] ?? $item['key'],
                        'level'      => (int)($item['level'] ?? 0),
                        'position'   => (int)($item['position'] ?? 0),
                        'is_active'  => (bool)($item['is_active'] ?? true),
                        'is_default' => (bool)($item['is_default'] ?? false),
                        'color'      => $item['color'] ?? null,
                    ]
                );
            }
        }
    }

    private function ensureSingleDefaultStatusPerScope(Board $board): void
    {
        $scopes = config('board_masters.scopes', []);

        foreach ($scopes as $scope) {
            $defaults = BoardStatus::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $scope)
                ->where('is_active', true)
                ->where('is_default', true)
                ->orderBy('position')
                ->get();

            if ($defaults->count() <= 1) continue;

            $keepId = $defaults->first()->id;

            BoardStatus::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $scope)
                ->where('is_default', true)
                ->where('id', '!=', $keepId)
                ->update(['is_default' => false]);
        }
    }

    private function ensureSingleDefaultPriorityPerScope(Board $board): void
    {
        $scopes = config('board_masters.scopes', []);

        foreach ($scopes as $scope) {
            $defaults = BoardPriority::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $scope)
                ->where('is_active', true)
                ->where('is_default', true)
                ->orderBy('position')
                ->get();

            if ($defaults->count() <= 1) continue;

            $keepId = $defaults->first()->id;

            BoardPriority::query()
                ->where('board_uuid', $board->uuid)
                ->where('scope', $scope)
                ->where('is_default', true)
                ->where('id', '!=', $keepId)
                ->update(['is_default' => false]);
        }
    }
}
