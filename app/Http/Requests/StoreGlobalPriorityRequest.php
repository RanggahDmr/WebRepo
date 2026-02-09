<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreGlobalPriorityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // authorize via policy di controller
    }

    public function rules(): array
    {
        return [
            'scope' => ['required', Rule::in(['EPIC', 'STORY', 'TASK'])],
            'key' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:30'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
