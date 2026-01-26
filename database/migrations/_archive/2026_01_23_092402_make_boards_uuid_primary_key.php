<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // IMPORTANT:
        // - Pastikan epics sudah tidak punya board_id lagi.
        // - Pastikan boards.uuid unique dan tidak null.

        DB::statement("ALTER TABLE boards DROP PRIMARY KEY");
        DB::statement("ALTER TABLE boards DROP COLUMN id");
        DB::statement("ALTER TABLE boards ADD PRIMARY KEY (uuid)");
    }

    public function down(): void
    {
        // biasanya dibuat irreversible karena restore id + repoint FK itu kompleks
        // bisa kamu kosongin atau throw exception
    }
};
