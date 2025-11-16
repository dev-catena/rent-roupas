<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Negotiation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'rental_id',
        'clothing_item_id',
        'initiator_id',
        'recipient_id',
        'professional_id',
        'type',
        'status',
        'proposed_price',
        'proposed_start_date',
        'proposed_end_date',
        'initial_message',
        'responded_at',
        'closed_at',
    ];

    protected $casts = [
        'proposed_price' => 'decimal:2',
        'proposed_start_date' => 'date',
        'proposed_end_date' => 'date',
        'responded_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    public function clothingItem()
    {
        return $this->belongsTo(ClothingItem::class);
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiator_id');
    }

    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    public function professional()
    {
        return $this->belongsTo(Professional::class);
    }

    public function messages()
    {
        return $this->hasMany(NegotiationMessage::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('initiator_id', $userId)
              ->orWhere('recipient_id', $userId);
        });
    }

    // Métodos auxiliares
    public function accept()
    {
        $this->update([
            'status' => 'accepted',
            'responded_at' => now(),
            'closed_at' => now(),
        ]);
    }

    public function reject()
    {
        $this->update([
            'status' => 'rejected',
            'responded_at' => now(),
            'closed_at' => now(),
        ]);
    }

    public function cancel()
    {
        $this->update([
            'status' => 'cancelled',
            'closed_at' => now(),
        ]);
    }

    public function complete()
    {
        $this->update([
            'status' => 'completed',
            'closed_at' => now(),
        ]);
    }

    public function unreadMessagesFor($userId)
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->count();
    }
}

