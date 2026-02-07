<?php

namespace App\Services;

use App\Models\Board;
use App\Models\BoardStatus;
use App\Models\BoardPriority;
use Illuminate\Validation\ValidationException;

class BoardMasterResolver
{
    public function defaultStatusKey(Board $board, string $scope): string
    {
        $key = BoardStatus::query()
            ->where('board_uuid', $board->uuid)
            ->where('scope', $scope)
            ->where('is_default', true)
            ->value('key');

        if (!$key) {
            throw ValidationException::withMessages([
                'status_key' => ["Default status not set for board {$board->uuid} scope {$scope}."],
            ]);
        }

        return $key;
    }

    public function defaultPriorityKey(Board $board, string $scope): string
    {
        $key = BoardPriority::query()
            ->where('board_uuid', $board->uuid)
            ->where('scope', $scope)
            ->where('is_default', true)
            ->value('key');

        if (!$key) {
            throw ValidationException::withMessages([
                'priority_key' => ["Default priority not set for board {$board->uuid} scope {$scope}."],
            ]);
        }

        return $key;
    }

    public function assertValidStatusKey(Board $board, string $scope, string $key): void
    {
        $exists = BoardStatus::query()
            ->where('board_uuid', $board->uuid)
            ->where('scope', $scope)
            ->where('key', $key)
            ->exists();

        if (!$exists) {
            throw ValidationException::withMessages([
                'status_key' => ["Invalid status '{$key}' for this board."],
            ]);
        }
    }

    public function assertValidPriorityKey(Board $board, string $scope, string $key): void
    {
        $exists = BoardPriority::query()
            ->where('board_uuid', $board->uuid)
            ->where('scope', $scope)
            ->where('key', $key)
            ->exists();

        if (!$exists) {
            throw ValidationException::withMessages([
                'priority_key' => ["Invalid priority '{$key}' for this board."],
            ]);
        }
    }
}
