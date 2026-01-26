<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // kalau tasks belum ada, skip (biar migrate gak mati)
        if (!Schema::hasTable('tasks')) {
            return;
        }

        Schema::table('tasks', function (Blueprint $table) {
            if (!Schema::hasColumn('tasks', 'type')) {
                $table->string('type')->nullable()->after('title'); 
            }

            if (!Schema::hasColumn('tasks', 'description')) {
                $table->text('description')->nullable()->after('type');
            }
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('tasks')) {
            return;
        }

        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('tasks', 'type')) {
                $table->dropColumn('type');
            }
        });
    }
};
