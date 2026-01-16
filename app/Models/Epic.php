<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class Epic extends Model
{
    protected $fillable = [
        'code',
        'create_work',
        'priority',
        'status',
        'created_by',
    ];

    public function getRouteKeyName()
    {
        return 'code';
    }
  
public static function generateCode(): string
{
    return 'EP-' . str_pad(self::max('id') + 1, 4, '0', STR_PAD_LEFT);
}

}
