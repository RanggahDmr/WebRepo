<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('story_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            // kalau kamu masih pakai FE/BE/QA, keep. kalau enggak, hapus.
            $table->string('type')->nullable();

            $table->string('priority')->default('MEDIUM'); // LOW|MEDIUM|HIGH
            $table->string('status')->default('TODO'); // TODO|IN_PROGRESS|IN_REVIEW|DONE
            $table->integer('position')->default(0);

            $table->foreignId('assignee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();

            $table->index(['story_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
