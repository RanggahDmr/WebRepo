<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('board_members', function (Blueprint $table) {
            $table->id();

            $table->uuid('board_uuid');
            $table->unsignedBigInteger('user_id');

            $table->timestamps();

            // FK
            $table->foreign('board_uuid')
                ->references('uuid')
                ->on('boards')
                ->cascadeOnDelete();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();

            // biar ga dobel
            $table->unique(['board_uuid', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('board_members');
    }
};
