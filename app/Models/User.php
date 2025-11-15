<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'avatar',
        'user_type',
        'latitude',
        'longitude',
        'address',
        'city',
        'state',
        'zipcode',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    // Relacionamentos
    public function measurements()
    {
        return $this->hasOne(UserMeasurement::class);
    }

    public function clothingItems()
    {
        return $this->hasMany(ClothingItem::class);
    }

    public function rentalsAsRenter()
    {
        return $this->hasMany(Rental::class, 'renter_id');
    }

    public function rentalsAsOwner()
    {
        return $this->hasMany(Rental::class, 'owner_id');
    }

    public function professional()
    {
        return $this->hasOne(Professional::class);
    }

    public function favorites()
    {
        return $this->belongsToMany(ClothingItem::class, 'favorites');
    }

    public function initiatedNegotiations()
    {
        return $this->hasMany(Negotiation::class, 'initiator_id');
    }

    public function receivedNegotiations()
    {
        return $this->hasMany(Negotiation::class, 'recipient_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Métodos auxiliares
    public function isProfessional()
    {
        return in_array($this->user_type, ['professional', 'both']) && $this->professional()->exists();
    }

    public function canRent()
    {
        return in_array($this->user_type, ['renter', 'both']);
    }

    public function canLend()
    {
        return in_array($this->user_type, ['owner', 'both']);
    }

    public function hasMeasurements()
    {
        return $this->measurements()->exists();
    }

    public function distanceTo($latitude, $longitude)
    {
        if (!$this->latitude || !$this->longitude) {
            return null;
        }

        // Fórmula de Haversine para calcular distância entre dois pontos
        $earthRadius = 6371; // em km

        $latFrom = deg2rad($this->latitude);
        $lonFrom = deg2rad($this->longitude);
        $latTo = deg2rad($latitude);
        $lonTo = deg2rad($longitude);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return $angle * $earthRadius;
    }
}

