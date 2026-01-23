<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\Story;

class Epic extends Model
{
    protected $fillable = [
        'code',
        'create_work',
        'description',
        'priority',
        'status',
        'created_by',
        'board_id'
    ];

    
 public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getRouteKeyName()
    {
        return 'code';
    }
       public function stories()
    {
        return $this->hasMany(Story::class);
    }
    public function board()
{
  return $this->belongsTo(Board::class);
}

  
public static function generateCode(): string
{
    return 'EP-' . str_pad(self::max('id') + 1, 4, '0', STR_PAD_LEFT);
}

}

