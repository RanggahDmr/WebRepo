<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User; 

class Task extends Model
{
    protected $fillable = [
    'story_id',
    'priority',
    'title',
    'description',
    'status',
    'position',
    'assignee_id',
    'created_by'


];
  public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }


    public function story()
    {
        return $this->belongsTo(Story::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }
}
