<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('professionals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Informações profissionais
            $table->enum('type', ['tailor', 'seamstress', 'designer', 'stylist', 'other'])->default('tailor');
            $table->text('bio')->nullable();
            $table->json('specialties')->nullable()->comment('Especialidades: ajustes, customização, etc');
            $table->integer('years_experience')->nullable();
            
            // Preços
            $table->decimal('base_price', 8, 2)->nullable()->comment('Preço base por serviço');
            $table->decimal('express_fee', 8, 2)->nullable()->comment('Taxa por serviço expresso');
            
            // Disponibilidade
            $table->json('availability')->nullable()->comment('Horários de disponibilidade');
            $table->boolean('accepts_express')->default(false);
            $table->boolean('is_available')->default(true);
            
            // Localização do ateliê
            $table->string('workshop_address')->nullable();
            $table->decimal('workshop_latitude', 10, 8)->nullable();
            $table->decimal('workshop_longitude', 11, 8)->nullable();
            
            // Avaliações
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('total_jobs')->default(0);
            $table->integer('total_reviews')->default(0);
            
            // Documentos
            $table->string('certificate')->nullable();
            $table->boolean('is_verified')->default(false);
            
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('professional_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('professional_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('rental_id')->nullable();
            $table->integer('rating')->comment('1 a 5 estrelas');
            $table->text('comment')->nullable();
            $table->timestamps();
            
            $table->unique(['professional_id', 'user_id', 'rental_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('professional_reviews');
        Schema::dropIfExists('professionals');
    }
};

