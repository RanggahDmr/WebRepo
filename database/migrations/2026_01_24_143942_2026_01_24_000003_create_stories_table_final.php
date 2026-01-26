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
        Schema::create('stories', function (Blueprint $table) {
    $table->uuid('uuid')->primary();

    $table->uuid('epic_uuid');
    $table->foreign('epic_uuid')->references('uuid')->on('epics')->cascadeOnDelete();

    $table->string('code')->nullable();
    $table->string('title');
    $table->text('description')->nullable();
    $table->string('priority')->nullable();
    $table->string('status')->default('TODO');

    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

    $table->timestamps();
    $table->index(['epic_uuid', 'status']);
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
