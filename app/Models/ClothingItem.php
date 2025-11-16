<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClothingItem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'category',
        'gender',
        'color',
        'brand',
        'condition',
        'shoulder_width',
        'chest',
        'waist',
        'hip',
        'length',
        'sleeve_length',
        'inseam',
        'size',
        'shoe_size',
        'price_per_day',
        'is_available',
        'in_use',
        'current_rental_id',
        'available_from',
        'available_until',
        'views_count',
        'rentals_count',
        'rating',
    ];

    protected $casts = [
        'shoulder_width' => 'decimal:2',
        'chest' => 'decimal:2',
        'waist' => 'decimal:2',
        'hip' => 'decimal:2',
        'length' => 'decimal:2',
        'sleeve_length' => 'decimal:2',
        'inseam' => 'decimal:2',
        'shoe_size' => 'decimal:1',
        'price_per_day' => 'decimal:2',
        'is_available' => 'boolean',
        'in_use' => 'boolean',
        'available_from' => 'date',
        'available_until' => 'date',
        'views_count' => 'integer',
        'rentals_count' => 'integer',
        'rating' => 'decimal:2',
    ];

    // Relacionamentos
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function photos()
    {
        return $this->hasMany(ClothingPhoto::class)->orderBy('order');
    }

    public function primaryPhoto()
    {
        return $this->hasOne(ClothingPhoto::class)->where('is_primary', true);
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function activeRentals()
    {
        return $this->hasMany(Rental::class)->whereIn('status', ['confirmed', 'active', 'adjustment_needed', 'ready']);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites');
    }

    public function negotiations()
    {
        return $this->hasMany(Negotiation::class);
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true)
                     ->where('in_use', false);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByGender($query, $gender)
    {
        return $query->where('gender', $gender);
    }

    public function scopePriceRange($query, $min, $max)
    {
        return $query->whereBetween('price_per_day', [$min, $max]);
    }

    // Métodos auxiliares
    public function incrementViews()
    {
        $this->increment('views_count');
    }

    public function isAvailableForDates($startDate, $endDate)
    {
        if (!$this->is_available) {
            return false;
        }

        // Verifica se há aluguéis conflitantes
        $conflicts = $this->activeRentals()
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                          ->where('end_date', '>=', $endDate);
                    });
            })
            ->exists();

        return !$conflicts;
    }

    public function updateRating()
    {
        $avgRating = $this->rentals()
            ->whereNotNull('renter_rating')
            ->avg('renter_rating');

        $this->update(['rating' => $avgRating]);
    }
}

