<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
  public function up(): void
  {
    // 1) bikin default board kalau belum ada
    $boardId = DB::table('boards')->where('title', 'Default Board')->value('id');

    if (!$boardId) {
      // created_by: pilih PM/admin pertama yang ada.
      // (Aman untuk tahap DB; nanti UI PM-only kamu atur di controller/policy)
      $pmId = DB::table('users')->where('role', 'PM')->orderBy('id')->value('id')
            ?? DB::table('users')->orderBy('id')->value('id');

      $boardId = DB::table('boards')->insertGetId([
        'squad' => (string) Str::uuid(),
        'title' => 'Default Board',
        'created_by' => $pmId,
        'created_at' => now(),
        'updated_at' => now(),
      ]);
    }

    // 2) assign semua epic yang belum punya board
    DB::table('epics')->whereNull('board_id')->update([
      'board_id' => $boardId,
      'updated_at' => now(),
    ]);
  }

  public function down(): void
  {
    // optional rollback (nggak wajib). Biasanya dibiarkan kosong agar tidak destructive.
  }
};
