<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MatchingController extends Controller
{
    protected $matchingService;

    public function __construct(MatchingService $matchingService)
    {
        $this->matchingService = $matchingService;
    }

    /**
     * Busca inteligente de peças baseada em medidas e localização
     */
    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category' => 'nullable|string',
            'gender' => 'nullable|in:male,female,unisex',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $filters = $request->only(['category', 'gender', 'min_price', 'max_price']);
        $limit = $request->get('limit', 20);

        $items = $this->matchingService->searchAndRank($user, $filters)
            ->take($limit);

        return response()->json([
            'success' => true,
            'message' => $user->hasMeasurements() 
                ? 'Resultados ordenados por compatibilidade e proximidade'
                : 'Cadastre suas medidas para obter resultados mais precisos',
            'data' => $items
        ]);
    }

    /**
     * Recomendações personalizadas
     */
    public function recommendations(Request $request)
    {
        $limit = $request->get('limit', 20);
        $user = $request->user();

        $recommendations = $this->matchingService->getRecommendations($user, $limit);

        return response()->json([
            'success' => true,
            'data' => $recommendations
        ]);
    }

    /**
     * Busca profissionais próximos
     */
    public function nearbyProfessionals(Request $request)
    {
        $user = $request->user();
        $maxDistance = $request->get('max_distance', 50);
        $limit = $request->get('limit', 10);

        if (!$user->latitude || !$user->longitude) {
            return response()->json([
                'success' => false,
                'message' => 'Configure sua localização para encontrar profissionais próximos'
            ], 400);
        }

        $professionals = $this->matchingService->findNearbyProfessionals($user, $maxDistance, $limit);

        return response()->json([
            'success' => true,
            'data' => $professionals
        ]);
    }
}

