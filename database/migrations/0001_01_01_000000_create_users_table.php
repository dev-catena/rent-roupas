<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('phone')->nullable();
            $table->string('avatar')->nullable();
            $table->enum('user_type', ['renter', 'owner', 'professional', 'both'])->default('renter');
            
            // Dados de localização
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('state')->nullable();
            $table->string('zipcode')->nullable();
            
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('user_measurements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Medidas corporais
            $table->decimal('weight', 5, 2)->nullable()->comment('Peso em kg');
            $table->decimal('height', 5, 2)->nullable()->comment('Altura em cm');
            $table->decimal('shoulder_width', 5, 2)->nullable()->comment('Largura de ombros em cm');
            $table->decimal('chest', 5, 2)->nullable()->comment('Busto/Peitoral em cm');
            $table->decimal('waist', 5, 2)->nullable()->comment('Cintura em cm');
            $table->decimal('hip', 5, 2)->nullable()->comment('Quadril em cm');
            $table->decimal('inseam', 5, 2)->nullable()->comment('Gancho/Entrepernas em cm');
            $table->decimal('arm_length', 5, 2)->nullable()->comment('Comprimento do braço em cm');
            $table->decimal('leg_length', 5, 2)->nullable()->comment('Comprimento da perna em cm');
            $table->decimal('neck', 5, 2)->nullable()->comment('Pescoço em cm');
            
            // Tamanhos padrão
            $table->string('shirt_size')->nullable()->comment('P, M, G, GG, etc');
            $table->string('pants_size')->nullable()->comment('36, 38, 40, etc');
            $table->string('dress_size')->nullable()->comment('36, 38, 40, etc');
            $table->decimal('shoe_size', 4, 1)->nullable()->comment('Número do sapato');
            
            // Preferências
            $table->enum('gender', ['male', 'female', 'unisex', 'other'])->nullable();
            $table->text('notes')->nullable()->comment('Observações adicionais');
            
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('user_measurements');
        Schema::dropIfExists('users');
    }
};

