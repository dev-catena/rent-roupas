<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clothing_items', function (Blueprint $table) {
            // Adiciona a nova coluna primeiro
            $table->foreignId('clothing_category_id')->nullable()->after('description')->constrained()->onDelete('set null');
        });
        
        // Depois remove a coluna antiga (se existir)
        if (Schema::hasColumn('clothing_items', 'category')) {
            Schema::table('clothing_items', function (Blueprint $table) {
                $table->dropColumn('category');
            });
        }
    }

    public function down(): void
    {
        Schema::table('clothing_items', function (Blueprint $table) {
            $table->dropForeign(['clothing_category_id']);
            $table->dropColumn('clothing_category_id');
        });
        
        // Recria a coluna antiga se necessário
        if (!Schema::hasColumn('clothing_items', 'category')) {
            Schema::table('clothing_items', function (Blueprint $table) {
                $table->enum('category', [
                    'dress', 'suit', 'shirt', 'pants', 'skirt', 'jacket', 
                    'coat', 'shoes', 'accessory', 'other'
                ])->nullable()->after('description');
            });
        }
    }
};

