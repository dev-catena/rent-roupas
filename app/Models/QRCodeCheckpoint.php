<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class QRCodeCheckpoint extends Model
{
    use HasFactory;

    protected $table = 'qr_code_checkpoints'; // Define o nome correto da tabela

    protected $fillable = [
        'negotiation_id',
        'type',
        'qr_code',
        'generated_by_user_id',
        'scanned_by_user_id',
        'status',
        'scanned_at',
        'notes',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
    ];

    public function negotiation()
    {
        return $this->belongsTo(Negotiation::class);
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by_user_id');
    }

    public function scannedBy()
    {
        return $this->belongsTo(User::class, 'scanned_by_user_id');
    }

    // Gera um QR Code único
    public static function generateQRCode($negotiationId, $type, $userId)
    {
        return static::create([
            'negotiation_id' => $negotiationId,
            'type' => $type,
            'qr_code' => Str::uuid()->toString(),
            'generated_by_user_id' => $userId,
            'status' => 'pending',
        ]);
    }

    // Marca o checkpoint como escaneado
    public function markAsScanned($userId, $notes = null)
    {
        $this->update([
            'status' => 'scanned',
            'scanned_by_user_id' => $userId,
            'scanned_at' => now(),
            'notes' => $notes,
        ]);
        
        // Marca que houve atualização para notificar outros usuários
        \Cache::put("negotiation_updated_{$this->negotiation_id}", time(), 60);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeScanned($query)
    {
        return $query->where('status', 'scanned');
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}
