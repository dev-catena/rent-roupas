<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ClothingPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'clothing_item_id',
        'photo_path',
        'order',
        'is_primary',
    ];

    protected $casts = [
        'order' => 'integer',
        'is_primary' => 'boolean',
    ];

    protected $appends = ['url'];

    public function clothingItem()
    {
        return $this->belongsTo(ClothingItem::class);
    }

    public function getUrlAttribute()
    {
        // Retorna URL completa para funcionar em APIs
        $path = Storage::url($this->photo_path);
        
        // Se a URL já for completa, retorna como está
        if (str_starts_with($path, 'http')) {
            return $path;
        }
        
        // Caso contrário, adiciona o domínio
        return url($path);
    }

    protected static function booted()
    {
        static::deleting(function ($photo) {
            // Remove o arquivo físico quando a foto é deletada
            Storage::delete($photo->photo_path);
        });
    }
}

