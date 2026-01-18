<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'clothing_item_id',
        'buyer_id',
        'seller_id',
        'sale_price',
        'platform_fee',
        'total_amount',
        'status',
        'payment_status',
        'payment_method',
        'paid_at',
        'delivered_at',
        'seller_rating',
        'buyer_rating',
        'seller_review',
        'buyer_review',
        'cancellation_reason',
    ];

    protected $casts = [
        'sale_price' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'delivered_at' => 'datetime',
        'seller_rating' => 'integer',
        'buyer_rating' => 'integer',
    ];

    public function clothingItem()
    {
        return $this->belongsTo(ClothingItem::class);
    }

    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }

    // Scopes
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
        $this->platform_fee = $this->sale_price * 0.10; // 10% de taxa da plataforma
        $this->total_amount = $this->sale_price + $this->platform_fee;
        $this->save();
    }

    public function confirm()
    {
        $this->update([
            'status' => 'confirmed',
        ]);
    }

    public function cancel($reason = null)
    {
        $this->update([
            'status' => 'cancelled',
            'cancellation_reason' => $reason,
        ]);
    }

    public function markAsPaid($paymentMethod = null)
    {
        $this->update([
            'status' => 'paid',
            'payment_status' => 'paid',
            'payment_method' => $paymentMethod,
            'paid_at' => now(),
        ]);
    }

    public function markAsDelivered()
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);
    }

    public function complete()
    {
        $this->update(['status' => 'completed']);
        // Marca o item como vendido e indisponível
        $this->clothingItem->update([
            'is_available' => false,
            'in_use' => true,
        ]);
    }
}
