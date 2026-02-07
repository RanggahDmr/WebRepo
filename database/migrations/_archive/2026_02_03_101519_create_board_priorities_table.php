<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('board_priorities', function (Blueprint $table) {
            $table->id();

            $table->uuid('board_uuid');
            $table->string('scope', 20); // EPIC | STORY | TASK

            $table->string('key', 50);    // contoh: low, medium, high
            $table->string('label', 100); // contoh: High

            // untuk sorting / perhitungan
            $table->unsignedInteger('level')->default(0);

            $table->unsignedInteger('position')->default(0);
            $table->boolean('is_default')->default(false);

            $table->timestamps();

            $table->foreign('board_uuid')
                ->references('uuid')
                ->on('boards')
                ->cascadeOnDelete();

            $table->unique(['board_uuid', 'scope', 'key'], 'board_priorities_unique_key');
            $table->index(['board_uuid', 'scope', 'position'], 'board_priorities_scope_position');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('board_priorities');
    }
};
