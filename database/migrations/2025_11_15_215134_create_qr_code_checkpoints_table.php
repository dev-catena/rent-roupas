<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_code_checkpoints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('negotiation_id')->constrained()->onDelete('cascade');
            $table->enum('type', [
                'delivery_to_professional',    // Locatária → Costureira
                'return_from_professional',    // Costureira → Locatária
                'return_to_owner'              // Locatária → Dono
            ]);
            $table->string('qr_code')->unique(); // Hash único para o QR Code
            $table->foreignId('generated_by_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('scanned_by_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['pending', 'scanned'])->default('pending');
            $table->timestamp('scanned_at')->nullable();
            $table->text('notes')->nullable(); // Observações ao escanear
            $table->timestamps();
            
            $table->index(['negotiation_id', 'type']);
            $table->index(['qr_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_code_checkpoints');
    }
};
