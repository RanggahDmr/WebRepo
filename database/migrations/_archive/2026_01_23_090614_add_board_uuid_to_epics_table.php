<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('epics', function (Blueprint $table) {
            $table->uuid('board_uuid')->nullable()->after('board_id');
            $table->index('board_uuid');
        });

        // backfill board_uuid dari board_id
        DB::statement("
            UPDATE epics e
            JOIN boards b ON b.id = e.board_id
            SET e.board_uuid = b.uuid
            WHERE e.board_id IS NOT NULL
        ");

        // set not null + FK
        Schema::table('epics', function (Blueprint $table) {
            // kalau DB kamu rewel soal change(), skip change() dan pastikan data sudah non-null.
            // $table->uuid('board_uuid')->nullable(false)->change();

            $table->foreign('board_uuid')
                ->references('uuid')->on('boards')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('epics', function (Blueprint $table) {
            $table->dropForeign(['board_uuid']);
            $table->dropIndex(['board_uuid']);
            $table->dropColumn('board_uuid');
        });
    }
};
