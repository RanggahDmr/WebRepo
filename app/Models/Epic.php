<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Epic extends Model
{

    protected $fillable = [
        'uuid',
        'board_uuid',
        'code',
        'title',
        'description',
        'priority',
        'status',
        'status_id',
        'priority_id',
        'created_by',
    ];

    public function getRouteKeyName()
    {
        return 'uuid';
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function board()
    {
        return $this->belongsTo(Board::class, 'board_uuid', 'uuid');
    }

    public function stories()
    {
        return $this->hasMany(Story::class, 'epic_uuid', 'uuid');
    }

    public static function generateCode(): string
    {
        return 'EP-' . strtoupper(Str::random(6));
    }

// App\Models\Epic.php
public function statusMaster()
{
    return $this->belongsTo(\App\Models\BoardStatus::class, 'status_id');
}

public function priorityMaster()
{
    return $this->belongsTo(\App\Models\BoardPriority::class, 'priority_id');
}

}
