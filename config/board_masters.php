<?php

return [
    'scopes' => ['EPIC', 'STORY', 'TASK'],

    'statuses' => [
        'EPIC' => [
            ['key' => 'todo',        'label' => 'To Do',        'position' => 10, 'is_default' => true,  'is_done' => false],
            ['key' => 'in_progress', 'label' => 'In Progress',  'position' => 20, 'is_default' => false, 'is_done' => false],
            ['key' => 'done',        'label' => 'Done',         'position' => 30, 'is_default' => false, 'is_done' => true ],
        ],
        'STORY' => [
            ['key' => 'todo',        'label' => 'To Do',        'position' => 10, 'is_default' => true,  'is_done' => false],
            ['key' => 'in_progress', 'label' => 'In Progress',  'position' => 20, 'is_default' => false, 'is_done' => false],
            ['key' => 'done',        'label' => 'Done',         'position' => 30, 'is_default' => false, 'is_done' => true ],
        ],
        'TASK' => [
            ['key' => 'todo',        'label' => 'To Do',        'position' => 10, 'is_default' => true,  'is_done' => false],
            ['key' => 'in_progress', 'label' => 'In Progress',  'position' => 20, 'is_default' => false, 'is_done' => false],
            ['key' => 'in_review',   'label' => 'In Review',    'position' => 30, 'is_default' => false, 'is_done' => false],
            ['key' => 'done',        'label' => 'Done',         'position' => 40, 'is_default' => false, 'is_done' => true ],
        ],
    ],

    'priorities' => [
        // kalau kamu mau beda per scope juga, tinggal pisah. Untuk sekarang sama.
        'EPIC' => [
            ['key' => 'low',    'label' => 'Low',    'level' => 10, 'position' => 10, 'is_default' => false],
            ['key' => 'medium', 'label' => 'Medium', 'level' => 20, 'position' => 20, 'is_default' => true ],
            ['key' => 'high',   'label' => 'High',   'level' => 30, 'position' => 30, 'is_default' => false],
        ],
        'STORY' => [
            ['key' => 'low',    'label' => 'Low',    'level' => 10, 'position' => 10, 'is_default' => false],
            ['key' => 'medium', 'label' => 'Medium', 'level' => 20, 'position' => 20, 'is_default' => true ],
            ['key' => 'high',   'label' => 'High',   'level' => 30, 'position' => 30, 'is_default' => false],
        ],
        'TASK' => [
            ['key' => 'low',    'label' => 'Low',    'level' => 10, 'position' => 10, 'is_default' => false],
            ['key' => 'medium', 'label' => 'Medium', 'level' => 20, 'position' => 20, 'is_default' => true ],
            ['key' => 'high',   'label' => 'High',   'level' => 30, 'position' => 30, 'is_default' => false],
        ],
    ],
];
