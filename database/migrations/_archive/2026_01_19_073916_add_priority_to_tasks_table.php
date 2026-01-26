<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    // database/migrations/xxxx_add_priority_to_tasks_table.php
public function up(): void
{
    Schema::table('tasks', function (Blueprint $table) {
        $table->string('priority')->default('MEDIUM')->after('description');
    });
}

public function down(): void
{
    Schema::table('tasks', function (Blueprint $table) {
        $table->dropColumn('priority');
    });
}

};
