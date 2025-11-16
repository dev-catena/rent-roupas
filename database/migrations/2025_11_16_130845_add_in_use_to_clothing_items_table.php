<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clothing_items', function (Blueprint $table) {
            $table->boolean('in_use')->default(false)->after('is_available');
            $table->foreignId('current_rental_id')->nullable()->after('in_use')->constrained('rentals')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('clothing_items', function (Blueprint $table) {
            $table->dropForeign(['current_rental_id']);
            $table->dropColumn(['in_use', 'current_rental_id']);
        });
    }
};
