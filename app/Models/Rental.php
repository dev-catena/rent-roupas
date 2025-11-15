<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Rental extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'clothing_item_id',
        'renter_id',
        'owner_id',
        'professional_id',
        'start_date',
        'end_date',
        'confirmed_at',
        'picked_up_at',
        'returned_at',
        'status',
        'daily_rate',
        'rental_days',
        'subtotal',
        'adjustment_fee',
        'platform_fee',
        'total_amount',
        'payment_status',
        'payment_method',
        'paid_at',
        'owner_rating',
        'renter_rating',
        'owner_review',
        'renter_review',
        'special_requirements',
        'cancellation_reason',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'confirmed_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'returned_at' => 'datetime',
        'daily_rate' => 'decimal:2',
        'rental_days' => 'integer',
        'subtotal' => 'decimal:2',
        'adjustment_fee' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'owner_rating' => 'integer',
        'renter_rating' => 'integer',
    ];

    public function clothingItem()
    {
        return $this->belongsTo(ClothingItem::class);
    }

    public function renter()
    {
        return $this->belongsTo(User::class, 'renter_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function professional()
    {
        return $this->belongsTo(Professional::class);
    }

    public function negotiation()
    {
        return $this->hasOne(Negotiation::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['confirmed', 'active', 'adjustment_needed', 'ready']);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    // Métodos auxiliares
    public function calculateTotal()
    {
        $this->rental_days = $this->start_date->diffInDays($this->end_date) + 1;
        $this->subtotal = $this->daily_rate * $this->rental_days;
        $this->platform_fee = $this->subtotal * 0.10; // 10% de taxa da plataforma
        $this->total_amount = $this->subtotal + $this->adjustment_fee + $this->platform_fee;
        $this->save();
    }

    public function confirm()
    {
        $this->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);
    }

    public function cancel($reason = null)
    {
        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
        ]);
    }

    public function markAsPickedUp()
    {
        $this->update([
            'status' => 'active',
            'picked_up_at' => now(),
        ]);
    }

    public function markAsReturned()
    {
        $this->update([
            'status' => 'returned',
            'returned_at' => now(),
        ]);
    }

    public function complete()
    {
        $this->update(['status' => 'completed']);
        $this->clothingItem->increment('rentals_count');
    }

    public function needsAdjustment()
    {
        $this->update(['status' => 'adjustment_needed']);
    }

    public function markAsReady()
    {
        $this->update(['status' => 'ready']);
    }
}

