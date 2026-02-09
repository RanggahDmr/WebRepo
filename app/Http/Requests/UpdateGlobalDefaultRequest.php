<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGlobalDefaultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // authorize via policy di controller
    }

    public function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:50'],
            'name' => ['required', 'string', 'max:100'],
            'color' => ['nullable', 'string', 'max:30'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_done' => ['required', 'boolean'],
            'is_active' => ['required', 'boolean'],
        ];
    }
}
