<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use App\Models\Task;
use App\Models\Story;
use App\Models\Epic;
use App\Observers\TaskObserver;
use App\Observers\StoryObserver;
use App\Observers\EpicObserver;


class AppServiceProvider extends ServiceProvider
{
   public function boot() : void
{
    Task::observe(TaskObserver::class);
     Story::observe(StoryObserver::class);
     Epic::observe(EpicObserver::class);
}

}
