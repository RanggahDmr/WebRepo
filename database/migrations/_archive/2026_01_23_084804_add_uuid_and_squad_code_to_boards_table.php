<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        // 1) Tambah kolom baru (uuid + squad_code)
        Schema::table('boards', function (Blueprint $table) {
            if (!Schema::hasColumn('boards', 'squad_code')) {
                $table->string('squad_code')->nullable()->after('id');
            }

            if (!Schema::hasColumn('boards', 'uuid')) {
                $table->uuid('uuid')->nullable()->after('squad_code');
            }
        });

        // 2) Backfill data:
        // - squad lama (SQD-PPZ, SQD-XMQ, dst) -> squad_code
        // - uuid -> generate baru (atau pakai squad kalau ternyata sudah UUID valid)
        $boards = DB::table('boards')->select('id', 'squad', 'uuid', 'squad_code')->get();

        foreach ($boards as $b) {
            $squad = $b->squad;

            $looksUuid = is_string($squad) && preg_match(
                '/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i',
                $squad
            );

            DB::table('boards')
                ->where('id', $b->id)
                ->update([
                    // kalau squad itu UUID, jangan masukin squad_code
                    'squad_code' => $b->squad_code ?? ($looksUuid ? null : $squad),
                    // isi uuid: pakai squad jika dia UUID; kalau bukan, generate baru
                    'uuid' => $b->uuid ?? ($looksUuid ? $squad : (string) Str::uuid()),
                ]);
        }

        // 3) Set uuid jadi unique (dan idealnya not null)
        // Unique aman di MySQL/PG/SQLite
        Schema::table('boards', function (Blueprint $table) {
            $table->unique('uuid', 'boards_uuid_unique');
            $table->index( 'boards_squad_code_index');
        });

        /**
         * CATATAN:
         * - Kalau kamu MySQL/Postgres dan pengen "NOT NULL", itu biasanya butuh alter column.
         * - Biar gak ribet (dan tanpa doctrine/dbal), kita pastiin lewat backfill bahwa uuid selalu terisi,
         *   lalu nanti bisa kamu enforce NOT NULL belakangan kalau perlu.
         */
    }

    public function down(): void
    {
        Schema::table('boards', function (Blueprint $table) {
            if (Schema::hasColumn('boards', 'uuid')) {
                $table->dropUnique('boards_uuid_unique');
            }

            if (Schema::hasColumn('boards', 'squad_code')) {
                $table->dropIndex('boards_squad_code_index');
            }

            $cols = [];
            if (Schema::hasColumn('boards', 'uuid')) $cols[] = 'uuid';
            if (Schema::hasColumn('boards', 'squad_code')) $cols[] = 'squad_code';

            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
