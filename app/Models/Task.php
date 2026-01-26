<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $primaryKey = 'uuid';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'uuid',
        'story_uuid',
        'code',
        'priority',
        'title',
        'description',
        'type',
        'status',
        'position',
        'assignee_id',
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

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function story()
    {
        return $this->belongsTo(Story::class, 'story_uuid', 'uuid');
    }
}
