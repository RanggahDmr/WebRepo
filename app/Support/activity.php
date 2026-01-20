<?php
use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;


if (!function_exists('log_activity')){
function log_activity(Model $subject, string $action, array $changes = [])
{
    ActivityLog::create([
        'user_id' => auth()->id(),
        'subject_type' => get_class($subject),
        'subject_id' => $subject->id,
        'action' => $action,
        'changes' => $changes,
    ]);
}
}