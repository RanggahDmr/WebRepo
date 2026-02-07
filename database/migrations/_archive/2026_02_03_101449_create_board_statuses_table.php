<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('board_statuses', function (Blueprint $table) {
            $table->id();

            // FK ke boards.uuid (PK uuid)
            $table->uuid('board_uuid');
            $table->string('scope', 20); // EPIC | STORY | TASK

            // status identifier (yang disimpan di epic/story/task)
            $table->string('key', 50);   // contoh: todo, in_progress, done
            $table->string('label', 100); // contoh: To Do

            $table->string('color', 30)->nullable(); // optional: untuk badge
            $table->unsignedInteger('position')->default(0);

            $table->boolean('is_default')->default(false);
            $table->boolean('is_done')->default(false);

            $table->timestamps();

            $table->foreign('board_uuid')
                ->references('uuid')
                ->on('boards')
                ->cascadeOnDelete();

            // Unique per board + scope
            $table->unique(['board_uuid', 'scope', 'key'], 'board_statuses_unique_key');
            $table->index(['board_uuid', 'scope', 'position'], 'board_statuses_scope_position');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('board_statuses');
    }
};
