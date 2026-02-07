<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // EPICS
        Schema::table('epics', function (Blueprint $table) {
            if (!Schema::hasColumn('epics', 'status_id')) {
                $table->foreignId('status_id')->nullable()->after('status');
            }
            if (!Schema::hasColumn('epics', 'priority_id')) {
                $table->foreignId('priority_id')->nullable()->after('priority');
            }
        });

        Schema::table('epics', function (Blueprint $table) {
            // FK dibuat terpisah biar aman di beberapa DB
            $table->foreign('status_id')->references('id')->on('board_statuses')->nullOnDelete();
            $table->foreign('priority_id')->references('id')->on('board_priorities')->nullOnDelete();
        });

        // STORIES
        Schema::table('stories', function (Blueprint $table) {
            if (!Schema::hasColumn('stories', 'status_id')) {
                $table->foreignId('status_id')->nullable()->after('status');
            }
            if (!Schema::hasColumn('stories', 'priority_id')) {
                $table->foreignId('priority_id')->nullable()->after('priority');
            }
        });

        Schema::table('stories', function (Blueprint $table) {
            $table->foreign('status_id')->references('id')->on('board_statuses')->nullOnDelete();
            $table->foreign('priority_id')->references('id')->on('board_priorities')->nullOnDelete();
        });

        // TASKS
        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'status_id')) {
                $table->foreignId('status_id')->nullable()->after('status');
            }
            if (!Schema::hasColumn('tasks', 'priority_id')) {
                $table->foreignId('priority_id')->nullable()->after('priority');
            }
        });

        Schema::table('tasks', function (Blueprint $table) {
            $table->foreign('status_id')->references('id')->on('board_statuses')->nullOnDelete();
            $table->foreign('priority_id')->references('id')->on('board_priorities')->nullOnDelete();
        });
    }

    public function down(): void
    {
        // Drop FK dulu, baru drop column

        Schema::table('tasks', function (Blueprint $table) {
            $table->dropForeign(['status_id']);
            $table->dropForeign(['priority_id']);
            $table->dropColumn(['status_id', 'priority_id']);
        });

        Schema::table('stories', function (Blueprint $table) {
            $table->dropForeign(['status_id']);
            $table->dropForeign(['priority_id']);
            $table->dropColumn(['status_id', 'priority_id']);
        });

        Schema::table('epics', function (Blueprint $table) {
            $table->dropForeign(['status_id']);
            $table->dropForeign(['priority_id']);
            $table->dropColumn(['status_id', 'priority_id']);
        });
    }
};
