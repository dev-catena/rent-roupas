<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClothingCategoryAttribute extends Model
{
    use HasFactory;

    protected $fillable = [
        'clothing_category_id',
        'attribute_name',
        'label',
        'type',
        'unit',
        'placeholder',
        'order',
        'is_required',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'order' => 'integer',
    ];

    // Relacionamentos
    public function category()
    {
        return $this->belongsTo(ClothingCategory::class, 'clothing_category_id');
    }
}

