<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserMeasurement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'weight',
        'height',
        'shoulder_width',
        'chest',
        'waist',
        'hip',
        'inseam',
        'arm_length',
        'leg_length',
        'neck',
        'shirt_size',
        'pants_size',
        'dress_size',
        'shoe_size',
        'gender',
        'notes',
    ];

    protected $casts = [
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
        'shoulder_width' => 'decimal:2',
        'chest' => 'decimal:2',
        'waist' => 'decimal:2',
        'hip' => 'decimal:2',
        'inseam' => 'decimal:2',
        'arm_length' => 'decimal:2',
        'leg_length' => 'decimal:2',
        'neck' => 'decimal:2',
        'shoe_size' => 'decimal:1',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calcula a compatibilidade (0-100) entre as medidas do usuário e uma peça de roupa
     */
    public function compatibilityWith(ClothingItem $item)
    {
        $score = 100;
        $measurements = 0;

        // Verifica cada medida disponível
        if ($item->shoulder_width && $this->shoulder_width) {
            $diff = abs($item->shoulder_width - $this->shoulder_width);
            $score -= min(20, $diff * 2);
            $measurements++;
        }

        if ($item->chest && $this->chest) {
            $diff = abs($item->chest - $this->chest);
            $score -= min(20, $diff * 1.5);
            $measurements++;
        }

        if ($item->waist && $this->waist) {
            $diff = abs($item->waist - $this->waist);
            $score -= min(20, $diff * 1.5);
            $measurements++;
        }

        if ($item->hip && $this->hip) {
            $diff = abs($item->hip - $this->hip);
            $score -= min(15, $diff * 1.5);
            $measurements++;
        }

        if ($item->inseam && $this->inseam) {
            $diff = abs($item->inseam - $this->inseam);
            $score -= min(15, $diff * 2);
            $measurements++;
        }

        if ($item->shoe_size && $this->shoe_size) {
            $diff = abs($item->shoe_size - $this->shoe_size);
            $score -= min(30, $diff * 10);
            $measurements++;
        }

        // Se não houver medidas para comparar, retorna null
        if ($measurements === 0) {
            return null;
        }

        return max(0, $score);
    }
}

