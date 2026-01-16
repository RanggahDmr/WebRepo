<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'story_id',
        'title',
        'status',
        'position',
        'assignee_id',
    ];

    public function story()
    {
        return $this->belongsTo(Story::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }
}
