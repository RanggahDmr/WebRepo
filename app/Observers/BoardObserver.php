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

            // ===== DEFAULT STATUSES =====
            // kamu bisa samakan semua scope dulu biar simpel
            $defaultStatuses = [
                ['key' => 'backlog',     'name' => 'BACKLOG',     'position' => 1, 'is_default' => true,  'is_done' => false],
                ['key' => 'in_progress', 'name' => 'IN_PROGRESS', 'position' => 2, 'is_default' => false, 'is_done' => false],
                ['key' => 'in_review',   'name' => 'IN_REVIEW',   'position' => 3, 'is_default' => false, 'is_done' => false],
                ['key' => 'done',        'name' => 'DONE',        'position' => 4, 'is_default' => false, 'is_done' => true],
            ];

            foreach ($scopes as $scope) {
                foreach ($defaultStatuses as $row) {
                    BoardStatus::firstOrCreate(
                        [
                            'board_uuid' => $board->uuid,
                            'scope' => $scope,
                            'key' => $row['key'],
                        ],
                        [
                            'name' => $row['name'],
                            'position' => $row['position'] ?? 0,
                            'is_default' => $row['is_default'],
                            'is_done' => $row['is_done'],
                            'is_locked' => true,
                            'is_active' => true,
                            'color' => null,
                        ]
                    );
                }
            }

            // ===== DEFAULT PRIORITIES =====
            $defaultPriorities = [
                ['key' => 'low',    'name' => 'LOW',    'position' => 1, 'is_default' => false],
                ['key' => 'medium', 'name' => 'MEDIUM', 'position' => 2, 'is_default' => true],
                ['key' => 'high',   'name' => 'HIGH',   'position' => 3, 'is_default' => false],
            ];

            foreach ($scopes as $scope) {
                foreach ($defaultPriorities as $row) {
                    BoardPriority::firstOrCreate(
                        [
                            'board_uuid' => $board->uuid,
                            'scope' => $scope,
                            'key' => $row['key'],
                        ],
                        [
                             'name'       => $row['name'],            //  INI YANG WAJIB
        'position'   => $row['position'] ?? 0,
        'is_default' => (bool) ($row['is_default'] ?? false),
        'is_active'  => true,                    // kalau kolom ada
        'color'      => $row['color'] ?? null,   // kalau kolom ada
                        ]
                    );
                }
            }
        });
    }
}
