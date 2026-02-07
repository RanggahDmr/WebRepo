<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Board;
use App\Models\Epic;
use App\Models\Story;
use App\Models\Task;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Support\UniqueCode;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1) Seed RBAC dulu
        $this->call([
            RbacSeeder::class,
            AdminUserSeeder::class, // optional
        ]);

        // 2) Ambil role-role
        $roleAdmin = Role::where('slug', 'admin')->first();
        $rolePm    = Role::where('slug', 'pm')->first();
        $roleDev   = Role::where('slug', 'developer')->first();
        $roleQa    = Role::where('slug', 'qa')->first();

        // 3) Users
        $pm = User::firstOrCreate(
            ['email' => 'pm@webrepo.test'],
            ['name' => 'PM User', 'password' => Hash::make('password')]
        );
        if ($rolePm) $pm->roles()->syncWithoutDetaching([$rolePm->id]);

        $sad = User::firstOrCreate(
            ['email' => 'sad@webrepo.test'],
            ['name' => 'SAD User', 'password' => Hash::make('password')]
        );
        // SAD kamu map ke developer (atau bikin role 'sad' kalau memang role beda)
        if ($roleDev) $sad->roles()->syncWithoutDetaching([$roleDev->id]);

        $prog = User::firstOrCreate(
            ['email' => 'prog@webrepo.test'],
            ['name' => 'Programmer User', 'password' => Hash::make('password')]
        );
        if ($roleDev) $prog->roles()->syncWithoutDetaching([$roleDev->id]);

        $qa = User::firstOrCreate(
            ['email' => 'qa@webrepo.test'],
            ['name' => 'QA User', 'password' => Hash::make('password')]
        );
        if ($roleQa) $qa->roles()->syncWithoutDetaching([$roleQa->id]);

        // pool assignee (dev/qa dll) -> sesuaikan kebutuhan
        $assigneePool = collect([$sad->id, $prog->id, $qa->id])->filter()->values()->all();
        if (count($assigneePool) === 0) $assigneePool = [$pm->id];

        // 4) Boards (creator = PM) + jadikan member otomatis
        $boards = collect([
            'WebRepo Core',
            'Frontend App',
            'Backend Services',
        ])->map(function ($title) use ($pm) {
            $board = Board::firstOrCreate(
                ['title' => $title],
                [
                    'uuid' => (string) Str::uuid(),
                    'squad_code' => null,
                    'created_by' => $pm->id,
                ]
            );

            // ⭐ penting: creator auto-member
            if (method_exists($board, 'members')) {
                $board->members()->syncWithoutDetaching([$pm->id]);
            }

            return $board;
        });

        // 5) Epics -> Stories -> Tasks
        $priorities = ['LOW', 'MEDIUM', 'HIGH'];
        $statusesEpicStory = ['TODO', 'IN_PROGRESS', 'DONE'];
        $taskStatuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

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
