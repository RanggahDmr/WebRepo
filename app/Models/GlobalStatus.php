<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GlobalStatus extends Model
{
    protected $table = 'global_statuses';

    protected $fillable = [
        'scope', 'key', 'name', 'color', 'sort_order',
        'is_done', 'is_active',
    ];

    protected $casts = [
        'is_done' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
