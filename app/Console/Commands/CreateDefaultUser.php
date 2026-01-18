<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateDefaultUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-default';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cria usuário padrão (vestme@vestme.com / vestme)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Verifica se o usuário já existe
        $existingUser = User::where('email', 'vestme@vestme.com')->first();
        
        if ($existingUser) {
            $this->info('Usuário padrão já existe. Atualizando senha...');
            $existingUser->update([
                'password' => Hash::make('vestme'),
            ]);
            $this->info('✅ Senha do usuário padrão atualizada!');
        } else {
            // Cria o usuário padrão
            $user = User::create([
                'name' => 'VestMe',
                'email' => 'vestme@vestme.com',
                'password' => Hash::make('vestme'),
                'user_type' => 'both', // Pode ser renter, owner, professional ou both
                'email_verified_at' => now(),
            ]);
            
            $this->info('✅ Usuário padrão criado com sucesso!');
        }
        
        $this->info('');
        $this->info('📧 Credenciais:');
        $this->info('   Email: vestme@vestme.com');
        $this->info('   Senha: vestme');
        
        return 0;
    }
}

