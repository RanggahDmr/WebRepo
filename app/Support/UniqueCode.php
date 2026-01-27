<?php

namespace App\Support;

use App\Models\Epic;
use App\Models\Story;
use App\Models\Task;

class UniqueCode
{
    public static function epic(): string
    {
        do { $c = CodeGen::epic(); }
        while (Epic::where('code', $c)->exists());
        return $c;
    }

    public static function story(): string
    {
        do { $c = CodeGen::story(); }
        while (Story::where('code', $c)->exists());
        return $c;
    }

    public static function task(): string
    {
        do { $c = CodeGen::task(); }
        while (Task::where('code', $c)->exists());
        return $c;
    }
}
