<?php

namespace App\Support;

use App\Models\Board;

class BoardMastersPresenter
{
    public static function make(Board $board): array
    {
        $statuses = $board->statuses()
            ->orderBy('scope')
            ->orderBy('position')
            ->get(['scope','key','label','color','position','is_default','is_done'])
            ->groupBy('scope')
            ->map(fn ($g) => $g->values());

        $priorities = $board->priorities()
            ->orderBy('scope')
            ->orderBy('position')
            ->get(['scope','key','label','level','position','is_default'])
            ->groupBy('scope')
            ->map(fn ($g) => $g->values());

        return [
            'statuses' => $statuses,
            'priorities' => $priorities,
        ];
    }
}
