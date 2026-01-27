<?php

namespace App\Support;

use Illuminate\Support\Str;

class CodeGen
{
    public static function epic(): string
    {
        return 'EP-' . Str::upper(Str::random(6));
    }

    public static function story(): string
    {
        return 'ST-' . Str::upper(Str::random(6));
    }

    public static function task(): string
    {
        return 'TS-' . Str::upper(Str::random(6));
    }
}
