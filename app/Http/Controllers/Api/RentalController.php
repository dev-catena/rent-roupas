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
        $rentals = Rental::with([
            'clothingItem.primaryPhoto', 
            'owner',
            'negotiation' => function($query) {
                $query->select('id', 'rental_id', 'status', 'clothing_item_id');
            }
        ])
            ->where('renter_id', $request->user()->id)
            ->whereNotIn('status', ['completed', 'cancelled'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $rentals
        ]);
    }

    public function myLendings(Request $request)
    {
        $lendings = Rental::with(['clothingItem.primaryPhoto', 'renter', 'negotiation'])
            ->where('owner_id', $request->user()->id)
            ->whereNotIn('status', ['completed', 'cancelled', 'returned']) // Apenas em andamento
            ->orderBy('created_at', 'desc')
            ->get(); // Não paginado para o bloco da home

        return response()->json([
            'success' => true,
            'data' => $lendings
        ]);
    }

    /**
     * Processa o pagamento do aluguel (apenas locatário)
     */
    public function processPayment(Request $request, $id)
    {
        $rental = Rental::findOrFail($id);
        $user = $request->user();

        // Verifica se o usuário é o locatário
        if ($rental->renter_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas o locatário pode realizar o pagamento'
            ], 403);
        }

        // Verifica se já foi pago
        if ($rental->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Este aluguel já foi pago'
            ], 400);
        }

        // Valida dados do pagamento
        $validator = Validator::make($request->all(), [
            'payment_method' => 'required|string|in:credit_card,debit_card,pix,bank_transfer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // TODO: Integrar com gateway de pagamento real (Mercado Pago, Stripe, etc.)
        // Por enquanto, apenas marca como pago
        $rental->update([
            'payment_status' => 'paid',
            'payment_method' => $request->payment_method,
            'paid_at' => now(),
        ]);

        // Gera QR Code para entrega (se não existir)
        $negotiation = $rental->negotiation;
        if ($negotiation) {
            $existingCheckpoint = \App\Models\QRCodeCheckpoint::where('negotiation_id', $negotiation->id)
                ->where('type', 'delivery_to_renter')
                ->first();
            
            if (!$existingCheckpoint) {
                \App\Models\QRCodeCheckpoint::create([
                    'negotiation_id' => $negotiation->id,
                    'type' => 'delivery_to_renter',
                    'qr_code' => \Illuminate\Support\Str::uuid()->toString(),
                    'generated_by_user_id' => $user->id,
                    'status' => 'pending',
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Pagamento processado com sucesso. O proprietário será notificado.',
            'data' => $rental->fresh()->load(['clothingItem', 'owner', 'renter', 'negotiation'])
        ]);
    }

    /**
     * Confirma que o locatário recebeu a roupa (apenas locatário)
     * Isso libera o pagamento para o proprietário
     */
    public function confirmPickup(Request $request, $id)
    {
        $rental = Rental::findOrFail($id);
        $user = $request->user();

        // Verifica se o usuário é o locatário
        if ($rental->renter_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas o locatário pode confirmar o recebimento'
            ], 403);
        }

        // Verifica se o pagamento foi feito
        if ($rental->payment_status !== 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'O pagamento deve ser realizado antes de confirmar o recebimento'
            ], 400);
        }

        // Verifica se já foi confirmado
        if ($rental->picked_up_at) {
            return response()->json([
                'success' => false,
                'message' => 'O recebimento já foi confirmado'
            ], 400);
        }

        // Confirma o recebimento e marca como ativo
        $rental->markAsPickedUp();

        // TODO: Liberar pagamento para o proprietário via gateway de pagamento
        // Por enquanto, apenas marca que o pagamento foi liberado

        return response()->json([
            'success' => true,
            'message' => 'Recebimento confirmado. O pagamento foi liberado para o proprietário.',
            'data' => $rental->fresh()->load(['clothingItem', 'owner', 'renter'])
        ]);
    }

    /**
     * Obtém o QR Code de entrega para o locatário (após pagamento)
     */
    public function getDeliveryQRCode(Request $request, $id)
    {
        $rental = Rental::findOrFail($id);
        $user = $request->user();

        // Verifica se o usuário é o locatário
        if ($rental->renter_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas o locatário pode visualizar o QR Code de entrega'
            ], 403);
        }

        // Verifica se o pagamento foi feito
        if ($rental->payment_status !== 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'O pagamento deve ser realizado antes de visualizar o QR Code'
            ], 400);
        }

        // Busca o QR Code
        $negotiation = $rental->negotiation;
        if (!$negotiation) {
            return response()->json([
                'success' => false,
                'message' => 'Negociação não encontrada'
            ], 404);
        }

        $checkpoint = \App\Models\QRCodeCheckpoint::where('negotiation_id', $negotiation->id)
            ->where('type', 'delivery_to_renter')
            ->first();

        if (!$checkpoint) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code não encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $checkpoint
        ]);
    }

    /**
     * Confirma que o proprietário entregou a roupa (apenas proprietário)
     */
    public function confirmDelivery(Request $request, $id)
    {
        $rental = Rental::findOrFail($id);
        $user = $request->user();

        // Verifica se o usuário é o proprietário
        if ($rental->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas o proprietário pode confirmar a entrega'
            ], 403);
        }

        // Verifica se o pagamento foi feito
        if ($rental->payment_status !== 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Aguardando pagamento do locatário'
            ], 400);
        }

        // Marca como pronto para retirada
        if ($rental->status !== 'ready') {
            $rental->markAsReady();
        }

        return response()->json([
            'success' => true,
            'message' => 'Entrega confirmada. Aguardando confirmação de recebimento do locatário.',
            'data' => $rental->fresh()->load(['clothingItem', 'owner', 'renter'])
        ]);
    }
}

