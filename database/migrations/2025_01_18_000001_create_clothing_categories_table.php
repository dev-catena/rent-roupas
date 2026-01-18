<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clothing_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Nome da categoria (ex: Vestido, Calça, Camisa)
            $table->string('slug')->unique(); // slug único (ex: dress, pants, shirt)
            $table->string('icon')->nullable(); // Ícone/emoji para a categoria
            $table->text('description')->nullable();
            $table->integer('order')->default(0); // Ordem de exibição
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clothing_categories');
    }
};

