<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
    $table->uuid('uuid')->primary();

    $table->uuid('story_uuid');
    $table->foreign('story_uuid')->references('uuid')->on('stories')->cascadeOnDelete();

    $table->string('code')->nullable();
    $table->string('title');
    $table->text('description')->nullable();

    $table->string('type')->nullable(); // FE/BE/QA (kalau mau)
    $table->string('priority')->default('MEDIUM');
    $table->string('status')->default('TODO');
    $table->integer('position')->default(0);

    $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

    $table->timestamps();
    $table->index(['story_uuid', 'status']);
});

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
