<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::table('epics', function (Blueprint $table) {
      $table->foreignId('board_id')
        ->nullable()
        ->after('id') // atau setelah kolom yang kamu mau
        ->constrained('boards')
        ->nullOnDelete();

      $table->index(['board_id']);
    });
  }

  public function down(): void
  {
    Schema::table('epics', function (Blueprint $table) {
      $table->dropConstrainedForeignId('board_id');
    });
  }
};
