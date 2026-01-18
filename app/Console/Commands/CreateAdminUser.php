<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:create {email?} {--password=} {--make-existing}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cria ou torna um usuário administrador';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->option('password');
        $makeExisting = $this->option('make-existing');

        // Se não forneceu email, perguntar
        if (!$email) {
            $email = $this->ask('Digite o email do usuário');
        }

        // Verifica se o usuário já existe
        $user = User::where('email', $email)->first();

        if ($user) {
            // Usuário existe
            if ($makeExisting || $this->confirm("Usuário '{$email}' já existe. Tornar administrador?", true)) {
                $user->is_admin = true;
                $user->is_blocked = false;
                $user->save();
                
                $this->info("✅ Usuário '{$user->name}' agora é administrador!");
                $this->info("   Email: {$user->email}");
                $this->info("   is_admin: " . ($user->is_admin ? 'true' : 'false'));
                return 0;
            } else {
                $this->info('Operação cancelada.');
                return 1;
            }
        } else {
            // Usuário não existe, criar novo
            if (!$password) {
                $password = $this->secret('Digite a senha para o novo usuário admin');
                $passwordConfirmation = $this->secret('Confirme a senha');
                
                if ($password !== $passwordConfirmation) {
                    $this->error('As senhas não coincidem!');
                    return 1;
                }
            }

            $name = $this->ask('Digite o nome do usuário', 'Administrador');
            $userType = $this->choice('Tipo de usuário', ['renter', 'owner', 'professional', 'both'], 'owner');

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'user_type' => $userType,
                'is_admin' => true,
                'is_blocked' => false,
                'email_verified_at' => now(),
            ]);

            $this->info("✅ Usuário administrador criado com sucesso!");
            $this->info("   Nome: {$user->name}");
            $this->info("   Email: {$user->email}");
            $this->info("   Tipo: {$user->user_type}");
            $this->info("   is_admin: " . ($user->is_admin ? 'true' : 'false'));
            
            return 0;
        }
    }
}

