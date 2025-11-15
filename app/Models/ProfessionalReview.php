<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProfessionalReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'professional_id',
        'user_id',
        'rental_id',
        'rating',
        'comment',
    ];

    protected $casts = [
        'rating' => 'integer',
    ];

    public function professional()
    {
        return $this->belongsTo(Professional::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }
}

