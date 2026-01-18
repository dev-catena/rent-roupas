<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clothing_category_attributes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('clothing_category_id')->constrained()->onDelete('cascade');
            $table->string('attribute_name'); // Nome do atributo (ex: shoulder_width, shoe_size)
            $table->string('label'); // Label para exibição (ex: Largura do Ombro, Número do Sapato)
            $table->string('type')->default('decimal'); // Tipo: decimal, string, integer
            $table->string('unit')->nullable(); // Unidade (ex: cm, número)
            $table->string('placeholder')->nullable(); // Placeholder para o campo
            $table->integer('order')->default(0); // Ordem de exibição
            $table->boolean('is_required')->default(false);
            $table->timestamps();
            
            // Índice para otimizar buscas
            $table->index('clothing_category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clothing_category_attributes');
    }
};

