<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

use App\Models\GlobalStatus;
use App\Models\GlobalPriority;
use App\Models\GlobalDefault;

use App\Policies\GlobalStatusPolicy;
use App\Policies\GlobalPriorityPolicy;
use App\Policies\GlobalDefaultPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        GlobalStatus::class => GlobalStatusPolicy::class,
        GlobalPriority::class => GlobalPriorityPolicy::class,
        GlobalDefault::class => GlobalDefaultPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
