<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Epic extends Model
{
    protected $fillable = [
        'code',
        'create_work',
        'priority',
        'status',
        'created_by',
    ];
}
