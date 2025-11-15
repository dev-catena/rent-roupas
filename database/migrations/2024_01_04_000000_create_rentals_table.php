<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clothing_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('renter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('professional_id')->nullable()->constrained('professionals')->onDelete('set null');
            
            // Datas
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('returned_at')->nullable();
            
            // Status
            $table->enum('status', [
                'pending',           // Aguardando confirmação do proprietário
                'confirmed',         // Confirmado pelo proprietário
                'adjustment_needed', // Necessita ajuste profissional
                'ready',            // Pronto para retirada
                'active',           // Em uso pelo locatário
                'returned',         // Devolvido
                'cancelled',        // Cancelado
                'completed'         // Concluído
            ])->default('pending');
            
            // Valores
            $table->decimal('daily_rate', 8, 2);
            $table->integer('rental_days');
            $table->decimal('subtotal', 8, 2);
            $table->decimal('adjustment_fee', 8, 2)->default(0);
            $table->decimal('platform_fee', 8, 2)->default(0);
            $table->decimal('total_amount', 8, 2);
            
            // Pagamento
            $table->enum('payment_status', ['pending', 'paid', 'refunded'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->timestamp('paid_at')->nullable();
            
            // Avaliação
            $table->integer('owner_rating')->nullable()->comment('Avaliação do proprietário sobre o locatário');
            $table->integer('renter_rating')->nullable()->comment('Avaliação do locatário sobre a peça');
            $table->text('owner_review')->nullable();
            $table->text('renter_review')->nullable();
            
            // Observações
            $table->text('special_requirements')->nullable();
            $table->text('cancellation_reason')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Índices
            $table->index(['renter_id', 'status']);
            $table->index(['owner_id', 'status']);
            $table->index(['start_date', 'end_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rentals');
    }
};

