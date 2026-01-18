<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Professional;
use Illuminate\Support\Facades\Hash;

class DefaultUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Usuário Administrador
        $admin = User::firstOrNew(['email' => 'admin@vestme.com.br']);
        $admin->name = 'Administrador';
        $admin->password = Hash::make('admin123');
        $admin->user_type = 'owner';
        $admin->is_admin = true;
        $admin->is_blocked = false;
        $admin->email_verified_at = now();
        $admin->save();
        $this->command->info('✅ Usuário Admin criado/atualizado: admin@vestme.com.br / admin123');

        // 2. Usuário Costureira (Profissional)
        $costureira = User::firstOrNew(['email' => 'costureira@gmail.com']);
        $costureira->name = 'Costureira Profissional';
        $costureira->password = Hash::make('11111111');
        $costureira->user_type = 'professional';
        $costureira->is_admin = false;
        $costureira->is_blocked = false;
        $costureira->email_verified_at = now();
        $costureira->save();

        // Criar perfil profissional para a costureira
        $professional = Professional::firstOrNew(['user_id' => $costureira->id]);
        $professional->type = 'seamstress';
        $professional->bio = 'Costureira profissional com anos de experiência em ajustes e reparos de roupas.';
        $professional->years_experience = 5;
        $professional->base_price = 50.00;
        $professional->workshop_address = 'Rua Exemplo, 123';
        $professional->is_verified = true;
        $professional->is_available = true;
        $professional->save();
        $this->command->info('✅ Usuário Costureira criado/atualizado: costureira@gmail.com / 11111111');

        // 3. Usuário Owner (Proprietário)
        $owner = User::firstOrNew(['email' => 'owner@gmail.com']);
        $owner->name = 'Proprietário de Roupas';
        $owner->password = Hash::make('11111111');
        $owner->user_type = 'owner';
        $owner->is_admin = false;
        $owner->is_blocked = false;
        $owner->email_verified_at = now();
        $owner->save();
        $this->command->info('✅ Usuário Owner criado/atualizado: owner@gmail.com / 11111111');

        // 4. Usuário Cliente (Renter)
        $cliente = User::firstOrNew(['email' => 'cliente@gmail.com']);
        $cliente->name = 'Cliente Alugador';
        $cliente->password = Hash::make('11111111');
        $cliente->user_type = 'renter';
        $cliente->is_admin = false;
        $cliente->is_blocked = false;
        $cliente->email_verified_at = now();
        $cliente->save();
        $this->command->info('✅ Usuário Cliente criado/atualizado: cliente@gmail.com / 11111111');

        $this->command->info('');
        $this->command->info('═══════════════════════════════════════════════════');
        $this->command->info('  Usuários padrão criados com sucesso!');
        $this->command->info('═══════════════════════════════════════════════════');
    }
}

