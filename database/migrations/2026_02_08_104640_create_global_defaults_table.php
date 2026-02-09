<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('global_defaults', function (Blueprint $table) {
            $table->id();

            $table->string('scope', 20); // EPIC | STORY | TASK

            $table->unsignedBigInteger('default_status_id');
            $table->unsignedBigInteger('default_priority_id');

            $table->timestamps();

            //  pastikan cuma 1 default per scope
            $table->unique('scope');

            // FK (optional tapi recommended)
            $table->foreign('default_status_id')
                ->references('id')->on('global_statuses')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->foreign('default_priority_id')
                ->references('id')->on('global_priorities')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('global_defaults');
    }
};
