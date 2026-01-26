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
    Schema::table('epics', function (Blueprint $table) {
        // HAPUS create_work

        // kalau kolom2 ini sudah ada di create_epics_table_final, lebih baik migration ini di-archive.
        // Tapi kalau belum ada, tambahin dengan guard biar aman:
        if (!Schema::hasColumn('epics', 'priority')) {
            $table->string('priority')->default('MEDIUM')->after('title');
        }
        if (!Schema::hasColumn('epics', 'status')) {
            $table->string('status')->default('TODO')->after('priority');
        }
        if (!Schema::hasColumn('epics', 'created_by')) {
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
        }
    });
}

public function down(): void
{
    Schema::table('epics', function (Blueprint $table) {
        $table->dropColumn([ 'priority', 'status', 'created_by']);
    });
}
};
