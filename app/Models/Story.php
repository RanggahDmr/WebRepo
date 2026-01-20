<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;


class Story extends Model
{
    use HasFactory;

    protected $fillable = [
        'epic_id',
        'code',
        'title',
        'description',
        'priority',
        'status',
        'created_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getRouteKeyName()
    {
        return 'code';
    }

    public function epic()
    {
        return $this->belongsTo(Epic::class);
    }
    public static function generateCode(): string
{
    return 'ST-' . strtoupper(Str::random(6));
}
    public function tasks()
{
    return $this->hasMany(Task::class)->orderBy('position');
}
  


}
