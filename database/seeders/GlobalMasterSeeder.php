<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class GlobalMasterSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        /**
         * STATUS per scope
         */
        $statusesByScope = [
            'EPIC' => [
                ['key' => 'todo',        'name' => 'TODO',        'sort_order' => 10, 'is_done' => false, 'is_active' => true],
                ['key' => 'in_progress', 'name' => 'IN PROGRESS', 'sort_order' => 20, 'is_done' => false, 'is_active' => true],
                ['key' => 'done',        'name' => 'DONE',        'sort_order' => 30, 'is_done' => true,  'is_active' => true],
            ],
            'STORY' => [
                ['key' => 'todo',        'name' => 'TODO',        'sort_order' => 10, 'is_done' => false, 'is_active' => true],
                ['key' => 'in_progress', 'name' => 'IN PROGRESS', 'sort_order' => 20, 'is_done' => false, 'is_active' => true],
                ['key' => 'done',        'name' => 'DONE',        'sort_order' => 30, 'is_done' => true,  'is_active' => true],
            ],
            'TASK' => [
                ['key' => 'todo',        'name' => 'TODO',        'sort_order' => 10, 'is_done' => false, 'is_active' => true],
                ['key' => 'in_progress', 'name' => 'IN PROGRESS', 'sort_order' => 20, 'is_done' => false, 'is_active' => true],
                ['key' => 'in_review',   'name' => 'IN REVIEW',   'sort_order' => 30, 'is_done' => false, 'is_active' => true],
                ['key' => 'done',        'name' => 'DONE',        'sort_order' => 40, 'is_done' => true,  'is_active' => true],
            ],
        ];

        /**
         * PRIORITY per scope
         */
        $prioritiesByScope = [
            'EPIC' => [
                ['key' => 'low',    'name' => 'LOW',    'sort_order' => 10, 'is_active' => true],
                ['key' => 'medium', 'name' => 'MEDIUM', 'sort_order' => 20, 'is_active' => true],
                ['key' => 'high',   'name' => 'HIGH',   'sort_order' => 30, 'is_active' => true],
            ],
            'STORY' => [
                ['key' => 'low',    'name' => 'LOW',    'sort_order' => 10, 'is_active' => true],
                ['key' => 'medium', 'name' => 'MEDIUM', 'sort_order' => 20, 'is_active' => true],
                ['key' => 'high',   'name' => 'HIGH',   'sort_order' => 30, 'is_active' => true],
            ],
            'TASK' => [
                ['key' => 'low',    'name' => 'LOW',    'sort_order' => 10, 'is_active' => true],
                ['key' => 'medium', 'name' => 'MEDIUM', 'sort_order' => 20, 'is_active' => true],
                ['key' => 'high',   'name' => 'HIGH',   'sort_order' => 30, 'is_active' => true],
            ],
        ];

        // ---- IF EXISTS guards ----
        $hasStatuses   = Schema::hasTable('global_statuses');
        $hasPriorities = Schema::hasTable('global_priorities');
        $hasDefaults   = Schema::hasTable('global_defaults');

        // 1) Seed global_statuses (if exists)
        if ($hasStatuses) {
            foreach ($statusesByScope as $scope => $rows) {
                foreach ($rows as $r) {
                    DB::table('global_statuses')->updateOrInsert(
                        ['scope' => $scope, 'key' => $r['key']],
                        [
                            'name' => $r['name'],
                            'color' => null,
                            'sort_order' => $r['sort_order'],
                            'is_done' => $r['is_done'],
                            'is_active' => $r['is_active'],
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]
                    );
                }
            }
        }

        // 2) Seed global_priorities (if exists)
        if ($hasPriorities) {
            foreach ($prioritiesByScope as $scope => $rows) {
                foreach ($rows as $r) {
                    DB::table('global_priorities')->updateOrInsert(
                        ['scope' => $scope, 'key' => $r['key']],
                        [
                            'name' => $r['name'],
                            'color' => null,
                            'sort_order' => $r['sort_order'],
                            'is_active' => $r['is_active'],
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]
                    );
                }
            }
        }

        // 3) Seed global_defaults per scope (if exists + dependencies exist)
        // Butuh global_statuses & global_priorities juga biar bisa ambil id default.
        if ($hasDefaults && $hasStatuses && $hasPriorities) {
            foreach (array_keys($statusesByScope) as $scope) {
                $defaultStatusId = DB::table('global_statuses')
                    ->where('scope', $scope)
                    ->where('key', 'todo')
                    ->value('id');

                $defaultPriorityId = DB::table('global_priorities')
                    ->where('scope', $scope)
                    ->where('key', 'medium')
                    ->value('id');

                // kalau salah satu belum ada, skip biar gak nyimpen null yg bikin constraint error
                if (! $defaultStatusId || ! $defaultPriorityId) {
                    continue;
                }

                DB::table('global_defaults')->updateOrInsert(
                    ['scope' => $scope],
                    [
                        'default_status_id' => $defaultStatusId,
                        'default_priority_id' => $defaultPriorityId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]
                );
            }
        }
    }
}
