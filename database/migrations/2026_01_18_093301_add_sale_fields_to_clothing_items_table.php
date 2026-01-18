<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('clothing_items', function (Blueprint $table) {
            $table->boolean('is_for_sale')->default(false)->after('price_per_day');
            $table->decimal('sale_price', 8, 2)->nullable()->after('is_for_sale');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clothing_items', function (Blueprint $table) {
            $table->dropColumn(['is_for_sale', 'sale_price']);
        });
    }
};
