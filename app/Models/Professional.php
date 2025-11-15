<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Professional extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'type',
        'bio',
        'specialties',
        'years_experience',
        'base_price',
        'express_fee',
        'availability',
        'accepts_express',
        'is_available',
        'workshop_address',
        'workshop_latitude',
        'workshop_longitude',
        'rating',
        'total_jobs',
        'total_reviews',
        'certificate',
        'is_verified',
    ];

    protected $casts = [
        'specialties' => 'array',
        'years_experience' => 'integer',
        'base_price' => 'decimal:2',
        'express_fee' => 'decimal:2',
        'availability' => 'array',
        'accepts_express' => 'boolean',
        'is_available' => 'boolean',
        'workshop_latitude' => 'decimal:8',
        'workshop_longitude' => 'decimal:8',
        'rating' => 'decimal:2',
        'total_jobs' => 'integer',
        'total_reviews' => 'integer',
        'is_verified' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function reviews()
    {
        return $this->hasMany(ProfessionalReview::class);
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function updateRating()
    {
        $avgRating = $this->reviews()->avg('rating');
        $totalReviews = $this->reviews()->count();

        $this->update([
            'rating' => $avgRating,
            'total_reviews' => $totalReviews,
        ]);
    }

    public function distanceTo($latitude, $longitude)
    {
        if (!$this->workshop_latitude || !$this->workshop_longitude) {
            return null;
        }

        $earthRadius = 6371; // em km

        $latFrom = deg2rad($this->workshop_latitude);
        $lonFrom = deg2rad($this->workshop_longitude);
        $latTo = deg2rad($latitude);
        $lonTo = deg2rad($longitude);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return $angle * $earthRadius;
    }
}

