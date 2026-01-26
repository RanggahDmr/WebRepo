<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (!Schema::hasTable('tasks')) {
            return;
        }

        if (Schema::hasColumn('tasks', 'type')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->dropColumn('type');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('tasks')) {
            return;
        }

        // Kalau kamu memang ingin bisa rollback, tambahin lagi:
        if (!Schema::hasColumn('tasks', 'type')) {
            Schema::table('tasks', function (Blueprint $table) {
                $table->string('type')->nullable()->after('title');
            });
        }
    }
};
