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
        Schema::create('epics', function (Blueprint $table) {
    $table->uuid('uuid')->primary();

    $table->uuid('board_uuid');
    $table->foreign('board_uuid')->references('uuid')->on('boards')->cascadeOnDelete();

    $table->string('code')->nullable(); // human-readable
    $table->string('title');


    $table->text('description')->nullable();
    $table->string('priority')->nullable();
    $table->string('status')->default('TODO');

    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

    $table->timestamps();
    $table->index(['board_uuid', 'status']);
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
