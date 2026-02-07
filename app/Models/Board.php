<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\BoardPriority;
use App\Models\BoardStatus;


class Board extends Model
{
    // protected $primaryKey = 'uuid';
    // public $incrementing = false;
    // protected $keyType = 'string';

    protected $fillable = ['uuid', 'squad_code', 'title', 'created_by'];

    public function getRouteKeyName()
    {
        return 'uuid';
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function epics()
    {
        return $this->hasMany(Epic::class, 'board_uuid', 'uuid');
    }
    public function members()
{
    return $this->belongsToMany(
        User::class,
        'board_members',
        'board_uuid', // pivot column yg nyimpan board uuid
        'user_id',   // pivot column yg nyimpan user id
        'uuid',
        'id'
    )->withTimestamps();
}
public function statuses()
{
    return $this->hasMany(\App\Models\BoardStatus::class, 'board_uuid', 'uuid');
}

public function priorities()
{
    return $this->hasMany(\App\Models\BoardPriority::class, 'board_uuid', 'uuid');
}

public function defaultStatus(string $scope)
{
    return $this->statuses()
        ->where('scope', $scope)
        ->where('is_default', true)
        ->where('is_active', true)
        ->orderBy('position')
        ->first();
}

public function defaultPriority(string $scope)
{
    return $this->priorities()
        ->where('scope', $scope)
        ->where('is_default', true)
        ->where('is_active', true)
        ->orderBy('position')
        ->first();
}

}
