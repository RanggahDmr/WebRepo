<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // boards: drop squad_code
        Schema::table('boards', function (Blueprint $table) {
            if (Schema::hasColumn('boards', 'squad_code')) {
                $table->dropColumn('squad_code');
            }
        });

        // users: drop role (legacy)
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'role')) {
                $table->dropColumn('role');
            }
        });

        // board_statuses: drop is_locked & is_default
        Schema::table('board_statuses', function (Blueprint $table) {
            $drops = [];

            if (Schema::hasColumn('board_statuses', 'is_locked')) {
                $drops[] = 'is_locked';
            }
            if (Schema::hasColumn('board_statuses', 'is_default')) {
                $drops[] = 'is_default';
            }

            if (!empty($drops)) {
                $table->dropColumn($drops);
            }
        });

        // board_priorities: drop is_locked & is_default
        Schema::table('board_priorities', function (Blueprint $table) {
            $drops = [];

            if (Schema::hasColumn('board_priorities', 'is_locked')) {
                $drops[] = 'is_locked';
            }
            if (Schema::hasColumn('board_priorities', 'is_default')) {
                $drops[] = 'is_default';
            }

            if (!empty($drops)) {
                $table->dropColumn($drops);
            }
        });
    }

    public function down(): void
    {
    }
};
