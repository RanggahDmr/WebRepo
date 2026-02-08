<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    //  JANGAN ubah primaryKey jika table masih punya id
    // cukup gunakan getRouteKeyName untuk route model binding uuid
    public function getRouteKeyName()
    {
        return 'uuid';
    }

    protected $fillable = [
        'uuid',
        'story_uuid',
        'code',

        //  master ids
        'priority_id',
        'status_id',

        // legacy strings (optional, bisa kamu hapus nanti)
        'priority',
        'status',

        'title',
        'description',
        'type',
        'position',
        'assignee_id',
        'created_by',
    ];

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

    public function statusMaster()
    {
        return $this->belongsTo(BoardStatus::class, 'status_id');
    }

    public function priorityMaster()
    {
        return $this->belongsTo(BoardPriority::class, 'priority_id');
    }
}
