<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;


class Board extends Model
{
    protected $primaryKey = 'uuid';
    public $incrementing = false;
    protected $keyType = 'string';

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
        'user_id'     // pivot column yg nyimpan user id
    )->withTimestamps();
}
}
