<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Professional;
use App\Models\ProfessionalReview;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfessionalController extends Controller
{
    public function index(Request $request)
    {
        $query = Professional::with('user')
            ->available();

        // Filtros
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('verified')) {
            $query->where('is_verified', $request->verified);
        }

        if ($request->has('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'rating');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $professionals = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $professionals
        ]);
    }

    public function show($id)
    {
        $professional = Professional::with(['user', 'reviews.user'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $professional
        ]);
    }

    public function registerAsProfessional(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:tailor,seamstress,designer,stylist,other',
            'bio' => 'required|string|min:50',
            'specialties' => 'nullable|array',
            'years_experience' => 'nullable|integer|min:0',
            'base_price' => 'required|numeric|min:0',
            'express_fee' => 'nullable|numeric|min:0',
            'availability' => 'nullable|array',
            'accepts_express' => 'nullable|boolean',
            'workshop_address' => 'required|string',
            'workshop_latitude' => 'required|numeric',
            'workshop_longitude' => 'required|numeric',
            'certificate' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Verifica se já é profissional
        if ($user->professional) {
            return response()->json([
                'success' => false,
                'message' => 'Você já está registrado como profissional'
            ], 400);
        }

        $data = $request->except('certificate');

        // Upload de certificado se fornecido
        if ($request->hasFile('certificate')) {
            $path = $request->file('certificate')->store('certificates', 'public');
            $data['certificate'] = $path;
        }

        $professional = $user->professional()->create($data);

        // Atualiza tipo de usuário
        if (!in_array($user->user_type, ['professional', 'both'])) {
            $user->update([
                'user_type' => $user->user_type === 'owner' ? 'both' : 'professional'
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cadastro profissional realizado com sucesso! Aguarde a verificação.',
            'data' => $professional
        ], 201);
    }

    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:seamstress,tailor,stylist,designer,other',
            'bio' => 'sometimes|string',
            'specialties' => 'sometimes|array',
            'years_of_experience' => 'sometimes|integer|min:0',
            'base_price' => 'sometimes|numeric|min:0',
            'express_fee' => 'sometimes|numeric|min:0',
            'availability' => 'sometimes|string',
            'accepts_express' => 'sometimes|boolean',
            'is_available' => 'sometimes|boolean',
            'workshop_address' => 'sometimes|string',
            'workshop_latitude' => 'sometimes|numeric',
            'workshop_longitude' => 'sometimes|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        if (!$user->professional) {
            return response()->json([
                'success' => false,
                'message' => 'Você não está registrado como profissional'
            ], 404);
        }

        $user->professional->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Perfil profissional atualizado com sucesso',
            'data' => $user->professional
        ]);
    }

    public function reviewProfessional(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rental_id' => 'required|exists:rentals,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $professional = Professional::findOrFail($id);
        $user = $request->user();

        // Cria ou atualiza avaliação
        $review = ProfessionalReview::updateOrCreate(
            [
                'professional_id' => $professional->id,
                'user_id' => $user->id,
                'rental_id' => $request->rental_id,
            ],
            [
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]
        );

        // Atualiza rating do profissional
        $professional->updateRating();

        return response()->json([
            'success' => true,
            'message' => 'Avaliação registrada com sucesso',
            'data' => $review
        ]);
    }
}

