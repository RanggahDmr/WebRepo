<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Story extends Model
{
    use HasFactory;

    protected $primaryKey = 'uuid';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'uuid',
        'epic_uuid',
        'code',
        'title',
        'description',
        'priority',
        'status',
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

    public function epic()
    {
        return $this->belongsTo(Epic::class, 'epic_uuid', 'uuid');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'story_uuid', 'uuid');
    }

    public static function generateCode(): string
    {
        return 'ST-' . strtoupper(Str::random(6));
    }
}
