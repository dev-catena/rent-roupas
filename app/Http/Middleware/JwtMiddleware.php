<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Middleware JWT customizado se necessário
        // Por enquanto, usando Sanctum como padrão
        return $next($request);
    }
}

