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
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clothing_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('buyer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('seller_id')->constrained('users')->onDelete('cascade');
            
            // Valores
            $table->decimal('sale_price', 8, 2);
            $table->decimal('platform_fee', 8, 2)->default(0);
            $table->decimal('total_amount', 8, 2);
            
            // Status
            $table->enum('status', [
                'pending',           // Aguardando confirmação do vendedor
                'confirmed',         // Confirmado pelo vendedor
                'paid',              // Pago
                'delivered',         // Entregue
                'completed',         // Concluído
                'cancelled'          // Cancelado
            ])->default('pending');
            
            // Pagamento
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            
            // Avaliações
            $table->integer('seller_rating')->nullable();
            $table->integer('buyer_rating')->nullable();
            $table->text('seller_review')->nullable();
            $table->text('buyer_review')->nullable();
            
            // Outros
            $table->text('cancellation_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
