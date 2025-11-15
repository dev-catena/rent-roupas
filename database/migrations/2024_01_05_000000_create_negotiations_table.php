<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('negotiations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rental_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('clothing_item_id')->constrained()->onDelete('cascade');
            $table->foreignId('initiator_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('recipient_id')->constrained('users')->onDelete('cascade');
            
            $table->enum('type', ['rental', 'adjustment', 'general'])->default('rental');
            $table->enum('status', ['active', 'accepted', 'rejected', 'cancelled', 'completed'])->default('active');
            
            // Proposta
            $table->decimal('proposed_price', 8, 2)->nullable();
            $table->date('proposed_start_date')->nullable();
            $table->date('proposed_end_date')->nullable();
            $table->text('initial_message')->nullable();
            
            $table->timestamp('responded_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            $table->index(['initiator_id', 'status']);
            $table->index(['recipient_id', 'status']);
        });

        Schema::create('negotiation_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('negotiation_id')->constrained()->onDelete('cascade');
            $table->foreignId('sender_id')->constrained('users')->onDelete('cascade');
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index(['negotiation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('negotiation_messages');
        Schema::dropIfExists('negotiations');
    }
};

