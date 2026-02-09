<?php

namespace App\Http\Controllers;

use App\Models\Epic;
use App\Models\Story;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Support\UniqueCode;
use App\Support\BoardAccess;

class StoryController extends Controller
{
    /**
     * Ambil default global untuk scope tertentu (EPIC/STORY/TASK)
     */
    private function getGlobalDefaults(string $scope): array
    {
        $row = DB::table('global_defaults')
            ->where('scope', $scope)
            ->first(['default_status_id', 'default_priority_id']);

        return [
            'status_id' => $row?->default_status_id,
            'priority_id' => $row?->default_priority_id,
        ];
    }

    /**
     * Validasi status_id agar:
     * - ada di global_statuses
     * - scope sesuai
     * - is_active = 1
     */
    private function validateGlobalStatusId(string $scope, ?int $statusId): ?int
    {
        if (!$statusId) return null;

        $valid = DB::table('global_statuses')
            ->where('id', $statusId)
            ->where('scope', $scope)
            ->where('is_active', true)
            ->value('id');

        return $valid ?: null;
    }

    /**
     * Validasi priority_id agar:
     * - ada di global_priorities
     * - scope sesuai
     * - is_active = 1
     */
    private function validateGlobalPriorityId(string $scope, ?int $priorityId): ?int
    {
        if (!$priorityId) return null;

        $valid = DB::table('global_priorities')
            ->where('id', $priorityId)
            ->where('scope', $scope)
            ->where('is_active', true)
            ->value('id');

        return $valid ?: null;
    }

    /**
     * (Tetap seperti punyamu) kalau user akses /stories/{story}
     * kita redirect ke halaman epic show.
     */
    public function show(Story $story)
    {
        $story->load('epic');
        return redirect()->route('epics.show', $story->epic);
    }

    /**
     * Create Story (pindahan dari EpicPageController@storeStory)
     * Route ideal: POST /epics/{epic}/stories
     */
    public function store(Request $request, Epic $epic)
    {
        $user = $request->user();

        $epic->load('board');
        $board = $epic->board;

        if (!$board) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => 'Board not found for this epic.',
            ]);
        }

        if (!BoardAccess::canAccess($user, $board)) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => "You don't have access to this board.",
            ]);
        }

        abort_unless($user?->hasPermission('create_story'), 403);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],

            // optional override
            'status_id' => ['nullable', 'integer'],
            'priority_id' => ['nullable', 'integer'],
        ]);

        $defaults = $this->getGlobalDefaults('STORY');

        // resolve status_id / priority_id: request -> validate -> fallback global_defaults
        $statusId = $this->validateGlobalStatusId('STORY', $validated['status_id'] ?? null)
            ?: $defaults['status_id'];

        $priorityId = $this->validateGlobalPriorityId('STORY', $validated['priority_id'] ?? null)
            ?: $defaults['priority_id'];

        if (!$statusId || !$priorityId) {
            return back()->with('alert', [
                'type' => 'error',
                'message' => 'Global defaults for STORY are not configured yet.',
            ]);
        }

        Story::create([
            'uuid' => (string) Str::uuid(),
            'code' => UniqueCode::story(),
            'epic_uuid' => $epic->uuid,

            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,

            'status_id' => $statusId,
            'priority_id' => $priorityId,

            'created_by' => $user->id,
        ]);

        return redirect()->route('epics.show', $epic)->with('alert', [
            'type' => 'success',
            'message' => 'Story created.',
        ]);
    }

    /**
     * Update Story (pindahan dari EpicPageController@updateStory)
     * Route ideal: PATCH/PUT /stories/{story}
     */
    public function update(Request $request, Story $story)
    {
        $user = $request->user();

        $story->load('epic.board');
        $board = $story->epic?->board;

        if (!$board) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => 'Board not found for this story.',
            ]);
        }

        if (!BoardAccess::canAccess($user, $board)) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => "You don't have access to this board.",
            ]);
        }

        abort_unless($user?->hasPermission('update_story'), 403);

        $validated = $request->validate([
            'code' => ['sometimes', 'nullable', 'string', 'max:30', 'unique:stories,code,' . $story->uuid . ',uuid'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],

            // optional override (kalau tidak dikirim, jangan diubah)
            'status_id' => ['sometimes', 'nullable', 'integer'],
            'priority_id' => ['sometimes', 'nullable', 'integer'],
        ]);

        if (empty($validated)) return back();

        // Kalau status_id dikirim, validasi ke global master
        if (array_key_exists('status_id', $validated)) {
            $newStatusId = $this->validateGlobalStatusId('STORY', $validated['status_id']);
            if (!$newStatusId) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => 'Invalid status for STORY scope.',
                ]);
            }
            $validated['status_id'] = $newStatusId;
        }

        // Kalau priority_id dikirim, validasi ke global master
        if (array_key_exists('priority_id', $validated)) {
            $newPriorityId = $this->validateGlobalPriorityId('STORY', $validated['priority_id']);
            if (!$newPriorityId) {
                return back()->with('alert', [
                    'type' => 'error',
                    'message' => 'Invalid priority for STORY scope.',
                ]);
            }
            $validated['priority_id'] = $newPriorityId;
        }

        $story->update($validated);

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Story updated.',
        ]);
    }

    /**
     * Delete Story (pindahan dari EpicPageController@destroyStory)
     * Route ideal: DELETE /stories/{story}
     */
    public function destroy(Request $request, Story $story)
    {
        $user = $request->user();

        $story->load('epic.board');
        $board = $story->epic?->board;

        if ($board && !BoardAccess::canAccess($user, $board)) {
            return redirect()->route('dashboard')->with('alert', [
                'type' => 'error',
                'message' => "You don't have access to this board.",
            ]);
        }

        abort_unless($user?->hasPermission('delete_story'), 403);

        $story->delete();

        return back()->with('alert', [
            'type' => 'success',
            'message' => 'Story deleted.',
        ]);
    }
}
