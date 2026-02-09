<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // epics
        Schema::table('epics', function (Blueprint $table) {
            $drops = [];
            if (Schema::hasColumn('epics', 'status')) $drops[] = 'status';
            if (Schema::hasColumn('epics', 'priority')) $drops[] = 'priority';
            if (!empty($drops)) $table->dropColumn($drops);
        });

        // stories
        Schema::table('stories', function (Blueprint $table) {
            $drops = [];
            if (Schema::hasColumn('stories', 'status')) $drops[] = 'status';
            if (Schema::hasColumn('stories', 'priority')) $drops[] = 'priority';
            if (!empty($drops)) $table->dropColumn($drops);
        });

        // tasks
        Schema::table('tasks', function (Blueprint $table) {
            $drops = [];
            if (Schema::hasColumn('tasks', 'status')) $drops[] = 'status';
            if (Schema::hasColumn('tasks', 'priority')) $drops[] = 'priority';
            if (!empty($drops)) $table->dropColumn($drops);
        });
    }

    public function down(): void
    {
        // Biasanya gak perlu rollback untuk legacy columns.
        // Kalau kamu mau reversible, kita bisa tambah balik kolomnya dengan tipe yang sama.
    }
};
