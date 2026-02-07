<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('board_priorities', function (Blueprint $table) {
            $table->id();

            $table->uuid('board_uuid')->index();
            $table->string('scope', 16)->index(); // EPIC | STORY | TASK

            $table->string('key');   // low, medium, high, critical
            $table->string('name');
            $table->unsignedInteger('position')->default(0);

            $table->string('color')->nullable();

            $table->boolean('is_default')->default(false);

            $table->boolean('is_locked')->default(false);
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['board_uuid', 'scope', 'key']);
            $table->foreign('board_uuid')
                ->references('uuid')
                ->on('boards')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('board_priorities');
    }
};
