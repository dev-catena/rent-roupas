<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('professional_reviews', function (Blueprint $table) {
            $table->foreign('rental_id')->references('id')->on('rentals')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('professional_reviews', function (Blueprint $table) {
            $table->dropForeign(['rental_id']);
        });
    }
};

