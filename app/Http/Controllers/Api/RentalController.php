<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rental;
use App\Models\ClothingItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RentalController extends Controller
{
    public function index(Request $request)
    {
        $query = Rental::with(['clothingItem.primaryPhoto', 'renter', 'owner', 'professional']);

        // Filtros
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $rentals = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $rentals
        ]);
    }

    public function show($id)
    {
        $rental = Rental::with([
            'clothingItem.photos',
            'clothingItem.user',
            'renter',
            'owner',
            'professional.user'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $rental
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'clothing_item_id' => 'required|exists:clothing_items,id',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
            'special_requirements' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $item = ClothingItem::findOrFail($request->clothing_item_id);
        $user = $request->user();

        // Verifica se o usuário está tentando alugar sua própria peça
        if ($item->user_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não pode alugar sua própria peça'
            ], 400);
        }

        // Verifica disponibilidade
        if (!$item->isAvailableForDates($request->start_date, $request->end_date)) {
            return response()->json([
                'success' => false,
                'message' => 'Esta peça não está disponível para as datas solicitadas'
            ], 400);
        }

        // Calcula valores
        $startDate = \Carbon\Carbon::parse($request->start_date);
        $endDate = \Carbon\Carbon::parse($request->end_date);
        $rentalDays = $startDate->diffInDays($endDate) + 1;
        $subtotal = $item->price_per_day * $rentalDays;
        $platformFee = $subtotal * 0.10;
        $totalAmount = $subtotal + $platformFee;

        // Cria o aluguel
        $rental = Rental::create([
            'clothing_item_id' => $item->id,
            'renter_id' => $user->id,
            'owner_id' => $item->user_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'daily_rate' => $item->price_per_day,
            'rental_days' => $rentalDays,
            'subtotal' => $subtotal,
            'platform_fee' => $platformFee,
            'total_amount' => $totalAmount,
            'special_requirements' => $request->special_requirements,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Solicitação de aluguel criada com sucesso',
            'data' => $rental->load(['clothingItem', 'owner'])
        ], 201);
    }

    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:confirmed,cancelled,adjustment_needed,ready,active,returned,completed',
            'professional_id' => 'required_if:status,adjustment_needed|exists:professionals,id',
            'adjustment_fee' => 'required_if:status,adjustment_needed|numeric|min:0',
            'cancellation_reason' => 'required_if:status,cancelled|string',
            'rating' => 'required_if:status,completed|integer|min:1|max:5',
            'review' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $rental = Rental::findOrFail($id);
        $user = $request->user();

        // Verifica permissões
        $isOwner = $rental->owner_id === $user->id;
        $isRenter = $rental->renter_id === $user->id;

        if (!$isOwner && !$isRenter) {
            return response()->json([
                'success' => false,
                'message' => 'Você não tem permissão para atualizar este aluguel'
            ], 403);
        }

        $newStatus = $request->status;

        // Lógica de transição de status
        switch ($newStatus) {
            case 'confirmed':
                if (!$isOwner) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Apenas o proprietário pode confirmar o aluguel'
                    ], 403);
                }
                $rental->confirm();
                break;

            case 'cancelled':
                $rental->cancel($request->cancellation_reason);
                break;

            case 'adjustment_needed':
                if (!$isOwner && !$isRenter) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Permissão negada'
                    ], 403);
                }
                $rental->update([
                    'status' => 'adjustment_needed',
                    'professional_id' => $request->professional_id,
                    'adjustment_fee' => $request->adjustment_fee,
                ]);
                $rental->calculateTotal();
                break;

            case 'ready':
                $rental->markAsReady();
                break;

            case 'active':
                $rental->markAsPickedUp();
                break;

            case 'returned':
                $rental->markAsReturned();
                break;

            case 'completed':
                if ($isRenter) {
                    $rental->update([
                        'renter_rating' => $request->rating,
                        'renter_review' => $request->review,
                    ]);
                } elseif ($isOwner) {
                    $rental->update([
                        'owner_rating' => $request->rating,
                        'owner_review' => $request->review,
                    ]);
                }
                
                // Completa se ambos avaliaram
                if ($rental->renter_rating && $rental->owner_rating) {
                    $rental->complete();
                    $rental->clothingItem->updateRating();
                }
                break;
        }

        return response()->json([
            'success' => true,
            'message' => 'Status do aluguel atualizado com sucesso',
            'data' => $rental->fresh()->load(['clothingItem', 'owner', 'renter', 'professional'])
        ]);
    }

    public function myRentals(Request $request)
    {
        $rentals = Rental::with(['clothingItem.primaryPhoto', 'owner'])
            ->where('renter_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $rentals
        ]);
    }

    public function myLendings(Request $request)
    {
        $lendings = Rental::with(['clothingItem.primaryPhoto', 'renter'])
            ->where('owner_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $lendings
        ]);
    }
}

