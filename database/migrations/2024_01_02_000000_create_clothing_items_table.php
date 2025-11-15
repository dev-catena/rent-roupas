<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clothing_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Informações básicas
            $table->string('title');
            $table->text('description');
            $table->enum('category', [
                'dress', 'suit', 'shirt', 'pants', 'skirt', 'jacket', 
                'coat', 'shoes', 'accessory', 'other'
            ]);
            $table->enum('gender', ['male', 'female', 'unisex'])->default('unisex');
            $table->string('color')->nullable();
            $table->string('brand')->nullable();
            $table->enum('condition', ['new', 'like_new', 'good', 'fair'])->default('good');
            
            // Medidas da peça
            $table->decimal('shoulder_width', 5, 2)->nullable();
            $table->decimal('chest', 5, 2)->nullable();
            $table->decimal('waist', 5, 2)->nullable();
            $table->decimal('hip', 5, 2)->nullable();
            $table->decimal('length', 5, 2)->nullable();
            $table->decimal('sleeve_length', 5, 2)->nullable();
            $table->decimal('inseam', 5, 2)->nullable();
            $table->string('size')->nullable()->comment('Tamanho padrão: P, M, G, etc');
            $table->decimal('shoe_size', 4, 1)->nullable();
            
            // Preço e disponibilidade
            $table->decimal('price_per_day', 8, 2);
            $table->boolean('is_available')->default(true);
            $table->date('available_from')->nullable();
            $table->date('available_until')->nullable();
            
            // Estatísticas
            $table->integer('views_count')->default(0);
            $table->integer('rentals_count')->default(0);
            $table->decimal('rating', 3, 2)->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            
            // Índices para otimizar buscas
            $table->index(['category', 'is_available']);
            $table->index('user_id');
        });

        Schema::create('clothing_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clothing_item_id')->constrained()->onDelete('cascade');
            $table->string('photo_path');
            $table->integer('order')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clothing_photos');
        Schema::dropIfExists('clothing_items');
    }
};

