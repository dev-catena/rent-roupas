<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('negotiations', function (Blueprint $table) {
            $table->boolean('professional_confirmed')->default(false)->after('professional_id');
            $table->timestamp('professional_confirmed_at')->nullable()->after('professional_confirmed');
        });
    }

    public function down(): void
    {
        Schema::table('negotiations', function (Blueprint $table) {
            $table->dropColumn(['professional_confirmed', 'professional_confirmed_at']);
        });
    }
};
