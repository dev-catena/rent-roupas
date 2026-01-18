<?php

namespace App\Services;

use App\Models\ClothingItem;
use App\Models\User;
use App\Models\UserMeasurement;
use Illuminate\Support\Collection;

class MatchingService
{
    /**
     * Busca e ranqueia peças de roupa baseado nas medidas do usuário e proximidade geográfica
     */
    public function searchAndRank(User $user, array $filters = []): Collection
    {
        $query = ClothingItem::with(['user', 'primaryPhoto', 'photos'])
            ->available();

        // Aplica filtros básicos
        if (isset($filters['category'])) {
            // Pode ser ID da categoria ou slug
            if (is_numeric($filters['category'])) {
                $query->where('clothing_category_id', $filters['category']);
            } else {
                // Se for slug, busca o ID da categoria
                $category = \App\Models\ClothingCategory::where('slug', $filters['category'])->first();
                if ($category) {
                    $query->where('clothing_category_id', $category->id);
                }
            }
        }

        if (isset($filters['gender'])) {
            $query->where('gender', $filters['gender']);
        }

        if (isset($filters['min_price'])) {
            $query->where('price_per_day', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price_per_day', '<=', $filters['max_price']);
        }

        $items = $query->get();

        // Se o usuário não tem medidas, retorna ordenado por distância ou popularidade
        if (!$user->hasMeasurements()) {
            return $this->rankByProximity($items, $user);
        }

        // Ranqueia por compatibilidade de medidas e proximidade
        return $this->rankByCompatibility($items, $user);
    }

    /**
     * Recomenda peças baseado no histórico e preferências do usuário
     */
    public function getRecommendations(User $user, int $limit = 20): Collection
    {
        // Busca IDs de categorias que o usuário já alugou ou favoritou
        $favoriteCategoryIds = collect();
        try {
            $favorites = $user->favorites()->with('category')->get();
            $favoriteCategoryIds = $favorites->pluck('clothing_category_id')->filter()->unique();
        } catch (\Exception $e) {
            // Se não houver favoritos ou tabela não existir, continua
        }
            
        $rentedCategoryIds = collect();
        try {
            $rentals = $user->rentalsAsRenter()
                ->with(['clothingItem' => function($query) {
                    $query->with('category');
                }])
                ->get();
            $rentedCategoryIds = $rentals
                ->pluck('clothingItem.clothing_category_id')
                ->filter()
                ->unique();
        } catch (\Exception $e) {
            // Se não houver aluguéis ou tabela não existir, continua
        }

        $preferredCategoryIds = $favoriteCategoryIds->merge($rentedCategoryIds)->unique();

        $query = ClothingItem::with(['user', 'primaryPhoto', 'photos', 'category'])
            ->available()
            ->where('user_id', '!=', $user->id); // Não mostra próprias peças

        // Prioriza categorias de interesse
        if ($preferredCategoryIds->isNotEmpty()) {
            $query->whereIn('clothing_category_id', $preferredCategoryIds->toArray());
        }

        // Busca peças bem avaliadas (ou sem avaliação ainda)
        $query->where(function($q) {
            $q->whereNull('rating')
              ->orWhere('rating', '>=', 4.0);
        });

        $items = $query->limit($limit * 3)->get(); // Busca mais para rankear

        // Se não houver itens, retorna itens disponíveis sem filtro de categoria
        if ($items->isEmpty()) {
            $query = ClothingItem::with(['user', 'primaryPhoto', 'photos', 'category'])
                ->available()
                ->where('user_id', '!=', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit($limit);
            $items = $query->get();
        }

        return $this->rankByCompatibility($items, $user)->take($limit);
    }

    /**
     * Ranqueia peças por compatibilidade de medidas e proximidade geográfica
     */
    protected function rankByCompatibility(Collection $items, User $user): Collection
    {
        $userMeasurements = $user->measurements;
        $userLat = $user->latitude;
        $userLng = $user->longitude;

        return $items->map(function ($item) use ($userMeasurements, $userLat, $userLng) {
            $score = 0;

            // Score de compatibilidade de medidas (0-100)
            if ($userMeasurements) {
                $compatibilityScore = $userMeasurements->compatibilityWith($item);
                if ($compatibilityScore !== null) {
                    $score += $compatibilityScore * 0.6; // 60% do peso
                }
            }

            // Score de proximidade geográfica (0-40)
            if ($userLat && $userLng && $item->user->latitude && $item->user->longitude) {
                $distance = $item->user->distanceTo($userLat, $userLng);
                
                // Distâncias menores = maior pontuação
                if ($distance <= 5) {
                    $score += 40;
                } elseif ($distance <= 10) {
                    $score += 30;
                } elseif ($distance <= 20) {
                    $score += 20;
                } elseif ($distance <= 50) {
                    $score += 10;
                }

                $item->distance = round($distance, 1);
            }

            // Bonus por avaliação (0-10)
            if ($item->rating) {
                $score += ($item->rating / 5) * 10;
            }

            // Bonus por popularidade (0-5)
            if ($item->rentals_count > 0) {
                $score += min(5, $item->rentals_count);
            }

            $item->match_score = round($score, 2);
            
            return $item;
        })
        ->sortByDesc('match_score')
        ->values();
    }

    /**
     * Ranqueia peças apenas por proximidade geográfica
     */
    protected function rankByProximity(Collection $items, User $user): Collection
    {
        $userLat = $user->latitude;
        $userLng = $user->longitude;

        if (!$userLat || !$userLng) {
            return $items->sortByDesc('created_at')->values();
        }

        return $items->map(function ($item) use ($userLat, $userLng) {
            if ($item->user->latitude && $item->user->longitude) {
                $distance = $item->user->distanceTo($userLat, $userLng);
                $item->distance = round($distance, 1);
            } else {
                $item->distance = null;
            }

            return $item;
        })
        ->sortBy('distance')
        ->values();
    }

    /**
     * Busca profissionais próximos para ajustes
     */
    public function findNearbyProfessionals(User $user, int $maxDistance = 50, int $limit = 10): Collection
    {
        if (!$user->latitude || !$user->longitude) {
            return collect([]);
        }

        $professionals = \App\Models\Professional::with('user')
            ->available()
            ->get();

        return $professionals->map(function ($professional) use ($user) {
            $distance = $professional->distanceTo($user->latitude, $user->longitude);
            $professional->distance = $distance ? round($distance, 1) : null;
            return $professional;
        })
        ->filter(function ($professional) use ($maxDistance) {
            return $professional->distance !== null && $professional->distance <= $maxDistance;
        })
        ->sortBy('distance')
        ->take($limit)
        ->values();
    }
}

