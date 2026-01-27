<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
   Schema::create('boards', function (Blueprint $table) {
    $table->char('uuid', 36)->primary();

    $table->string('squad_code')->nullable(); // optional, kalau ga dipakai aman
    $table->string('title');

    $table->foreignId('created_by')
        ->constrained('users')
        ->cascadeOnDelete();

    $table->timestamps();

    $table->index(['created_by']);
});


  }

  public function down(): void
  {
    Schema::dropIfExists('boards');
  }
};
