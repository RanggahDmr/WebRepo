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
use App\Models\Board;
use App\Observers\TaskObserver;
use App\Observers\StoryObserver;
use App\Observers\EpicObserver;
use App\Observers\BoardObserver;




class AppServiceProvider extends ServiceProvider
{
     public function register(): void
    {
       
        $this->commands([
            \App\Console\Commands\SeedBoardMasters::class,
        ]);
    }
   public function boot() : void
{
    Task::observe(TaskObserver::class);
     Story::observe(StoryObserver::class);
     Epic::observe(EpicObserver::class);
        Board::observe(BoardObserver::class);
}

}
