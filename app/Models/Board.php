<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Board extends Model
{
  protected $fillable = ['squad', 'title', 'created_by'];

  public function creator()
  {
    return $this->belongsTo(User::class, 'created_by');
  }

  public function epics()
  {
    return $this->hasMany(Epic::class);
  }
  public function getRouteKeyName()
{
    return 'squad';
}

}

