<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('global_statuses', function (Blueprint $table) {
            $table->id();

            $table->string('scope', 20);           // EPIC | STORY | TASK
            $table->string('key', 50);             // ex: todo, in_progress
            $table->string('name', 100);           // ex: TODO, In Progress
            $table->string('color', 32)->nullable(); // ex: #ffcc00 or tailwind token (your choice)

            $table->unsignedInteger('sort_order')->default(0);

            $table->boolean('is_done')->default(false);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['scope', 'key']);
            $table->index(['scope', 'is_active']);
            $table->index(['scope', 'sort_order']);
            
        });

        Schema::create('global_priorities', function (Blueprint $table) {
            $table->id();

            $table->string('scope', 20);            // EPIC | STORY | TASK
            $table->string('key', 50);              // ex: low, medium
            $table->string('name', 100);            // ex: Low, Medium
            $table->string('color', 32)->nullable();

            $table->unsignedInteger('sort_order')->default(0);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['scope', 'key']);
            $table->index(['scope', 'is_active']);
            $table->index(['scope', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('global_priorities');
        Schema::dropIfExists('global_statuses');
    }
};
