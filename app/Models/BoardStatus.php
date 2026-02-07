<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoardStatus extends Model
{
  protected $fillable = [
    'board_uuid','scope','key','name','position','color',
    'is_default','is_done','is_locked','is_active',
  ];

  protected $casts = [
    'is_default' => 'boolean',
    'is_done' => 'boolean',
    'is_locked' => 'boolean',
    'is_active' => 'boolean',
    'position' => 'integer',
  ];

  public function board()
  {
    return $this->belongsTo(Board::class, 'board_uuid', 'uuid');
  }
}
