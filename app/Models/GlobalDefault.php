<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GlobalDefault extends Model
{
    protected $table = 'global_defaults';

    protected $fillable = [
        'scope',
        'default_status_id',
        'default_priority_id',
    ];

    public function defaultStatus()
    {
        return $this->belongsTo(GlobalStatus::class, 'default_status_id');
    }

    public function defaultPriority()
    {
        return $this->belongsTo(GlobalPriority::class, 'default_priority_id');
    }
}
