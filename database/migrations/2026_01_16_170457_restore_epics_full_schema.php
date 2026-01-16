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
        $table->string('create_work')->nullable()->after('code');
        $table->string('priority')->default('MEDIUM')->after('create_work');
        $table->string('status')->default('TODO')->after('priority');
        $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
    });
}

public function down(): void
{
    Schema::table('epics', function (Blueprint $table) {
        $table->dropColumn(['create_work', 'priority', 'status', 'created_by']);
    });
}
};
