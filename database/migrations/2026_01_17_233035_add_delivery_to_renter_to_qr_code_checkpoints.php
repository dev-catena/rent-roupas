<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Adiciona o novo tipo 'delivery_to_renter' ao enum
        DB::statement("ALTER TABLE qr_code_checkpoints MODIFY COLUMN type ENUM('delivery_to_professional', 'return_from_professional', 'return_to_owner', 'delivery_to_renter')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove o tipo 'delivery_to_renter' do enum
        DB::statement("ALTER TABLE qr_code_checkpoints MODIFY COLUMN type ENUM('delivery_to_professional', 'return_from_professional', 'return_to_owner')");
    }
};
