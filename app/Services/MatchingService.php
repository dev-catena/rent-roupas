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
            $query->where('category', $filters['category']);
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
        // Busca categorias que o usuário já alugou ou favoritou
        $favoriteCategories = $user->favorites()->pluck('category')->unique();
        $rentedCategories = $user->rentalsAsRenter()
            ->with('clothingItem')
            ->get()
            ->pluck('clothingItem.category')
            ->unique();

        $preferredCategories = $favoriteCategories->merge($rentedCategories)->unique();

        $query = ClothingItem::with(['user', 'primaryPhoto', 'photos'])
            ->available()
            ->where('user_id', '!=', $user->id); // Não mostra próprias peças

        // Prioriza categorias de interesse
        if ($preferredCategories->isNotEmpty()) {
            $query->whereIn('category', $preferredCategories->toArray());
        }

        // Busca peças bem avaliadas
        $query->where(function($q) {
            $q->whereNull('rating')
              ->orWhere('rating', '>=', 4.0);
        });

        $items = $query->limit($limit * 3)->get(); // Busca mais para rankear

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

