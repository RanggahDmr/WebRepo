<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Board;
use App\Models\Epic;
use App\Models\Story;
use App\Models\Task;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Support\UniqueCode;


class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ========= USERS =========
        $pm = User::firstOrCreate(
            ['email' => 'pm@webrepo.test'],
            ['name' => 'PM User', 'password' => Hash::make('password'), 'role' => 'PM']
        );

        $sad = User::firstOrCreate(
            ['email' => 'sad@webrepo.test'],
            ['name' => 'SAD User', 'password' => Hash::make('password'), 'role' => 'SAD']
        );

        $prog = User::firstOrCreate(
            ['email' => 'prog@webrepo.test'],
            ['name' => 'Programmer User', 'password' => Hash::make('password'), 'role' => 'PROGRAMMER']
        );

        // pool assignee (SAD/PROGRAMMER)
        $assigneePool = User::query()
            ->whereIn('role', ['SAD', 'PROGRAMMER'])
            ->pluck('id')
            ->all();

        if (count($assigneePool) === 0) {
            $assigneePool = [$prog->id];
        }

        // ========= BOARDS =========
        $boards = collect([
            'WebRepo Core',
            'Frontend App',
            'Backend Services',
        ])->map(function ($title) use ($pm) {
            return Board::create([
                // uuid auto (kalau sudah booted), kalau belum, isi manual:
                'uuid' => (string) Str::uuid(),
                'squad_code' => null,
                'title' => $title,
                'created_by' => $pm->id,
            ]);
        });

        // ========= EPICS -> STORIES -> TASKS =========
        $priorities = ['LOW', 'MEDIUM', 'HIGH'];
        $statusesEpicStory = ['TODO', 'IN_PROGRESS', 'DONE'];

        // Task fields kamu: type, priority, status, position, assignee_id
      
        $taskStatuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']; // sesuaikan kalau enum kamu beda

        foreach ($boards as $board) {
            for ($e = 1; $e <= 3; $e++) {
                $epic = Epic::create([
                    'uuid' => (string) Str::uuid(),
                    'board_uuid' => $board->uuid,
                    'code' => UniqueCode::epic(),
                    'title' => "Epic $e - {$board->title}",
                    'description' => "Description for Epic $e on {$board->title}",
                    'priority' => $priorities[array_rand($priorities)],
                    'status' => $statusesEpicStory[array_rand($statusesEpicStory)],
                    'created_by' => $pm->id,
                ]);

                for ($s = 1; $s <= 4; $s++) {
                    $story = Story::create([
                        'uuid' => (string) Str::uuid(),
                        'epic_uuid' => $epic->uuid,
                     'code' => UniqueCode::story(),
                        'title' => "Story $s for {$epic->title}",
                        'description' => "Story description $s for {$epic->title}",
                        'priority' => $priorities[array_rand($priorities)],
                        'status' => $statusesEpicStory[array_rand($statusesEpicStory)],
                        'created_by' => $pm->id,
                    ]);

                    // posisi task per story dibuat rapi 1..N
                    for ($t = 1; $t <= 6; $t++) {
                        Task::create([
                            'uuid' => (string) Str::uuid(),
                            'story_uuid' => $story->uuid,
                            'code' => UniqueCode::task(),
                            'title' => "Task $t for {$story->title}",
                            'description' => "Task description $t",
                           
                            'priority' => $priorities[array_rand($priorities)],
                            'status' => $taskStatuses[array_rand($taskStatuses)],
                            'position' => $t,
                            'assignee_id' => $assigneePool[array_rand($assigneePool)],
                            'created_by' => $pm->id,
                        ]);
                    }
                }
            }
        }
    }
}
