<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Professional;
use App\Models\ClothingCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Login administrativo
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email não encontrado'
            ], 401);
        }

        if ($user->is_blocked) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado. Sua conta foi bloqueada.',
                'error' => 'account_blocked'
            ], 403);
        }

        // Verificar se é administrador
        if (!$user->is_admin) {
            return response()->json([
                'success' => false,
                'message' => 'Acesso negado. Você precisa ter permissão de administrador.'
            ], 403);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Senha incorreta'
            ], 401);
        }

        $token = $user->createToken('admin_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login realizado com sucesso',
            'token' => $token,
            'user' => $user
        ]);
    }

    /**
     * Listar todos os usuários
     */
    public function getAllUsers(Request $request)
    {
        $users = User::with(['professional', 'measurements'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    /**
     * Bloquear usuário
     */
    public function blockUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $user->update(['is_blocked' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Usuário bloqueado com sucesso'
        ]);
    }

    /**
     * Desbloquear usuário
     */
    public function unblockUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $user->update(['is_blocked' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Usuário desbloqueado com sucesso'
        ]);
    }

    /**
     * Excluir usuário
     */
    public function deleteUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Usuário excluído com sucesso'
        ]);
    }

    /**
     * Listar profissionais pendentes
     */
    public function getPendingProfessionals(Request $request)
    {
        $professionals = Professional::with(['user'])
            ->where('is_verified', false)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($professionals);
    }

    /**
     * Listar todos os profissionais
     */
    public function getAllProfessionals(Request $request)
    {
        $professionals = Professional::with(['user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($professionals);
    }

    /**
     * Verificar profissional
     */
    public function verifyProfessional(Request $request, $id)
    {
        $professional = Professional::findOrFail($id);
        
        $professional->update(['is_verified' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Profissional verificado com sucesso'
        ]);
    }

    /**
     * Rejeitar profissional
     */
    public function rejectProfessional(Request $request, $id)
    {
        $professional = Professional::findOrFail($id);
        
        // Bloquear o usuário associado
        if ($professional->user) {
            $professional->user->update(['is_blocked' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profissional rejeitado com sucesso'
        ]);
    }

    /**
     * Bloquear profissional
     */
    public function blockProfessional(Request $request, $id)
    {
        $professional = Professional::findOrFail($id);
        
        if ($professional->user) {
            $professional->user->update(['is_blocked' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Profissional bloqueado com sucesso'
        ]);
    }

    /**
     * Listar todas as categorias de roupas
     */
    public function getAllClothingCategories(Request $request)
    {
        $categories = ClothingCategory::with('attributes')
            ->orderBy('order')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Criar categoria de roupa
     */
    public function createClothingCategory(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:clothing_categories,slug',
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $category = ClothingCategory::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Categoria criada com sucesso',
            'data' => $category
        ], 201);
    }

    /**
     * Atualizar categoria de roupa
     */
    public function updateClothingCategory(Request $request, $id)
    {
        $category = ClothingCategory::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:clothing_categories,slug,' . $id,
            'icon' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $category->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Categoria atualizada com sucesso',
            'data' => $category
        ]);
    }

    /**
     * Excluir categoria de roupa
     */
    public function deleteClothingCategory(Request $request, $id)
    {
        $category = ClothingCategory::findOrFail($id);
        
        // Verificar se há itens usando esta categoria
        if ($category->clothingItems()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Não é possível excluir esta categoria pois existem peças de roupa associadas a ela.'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Categoria excluída com sucesso'
        ]);
    }
}

