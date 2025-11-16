<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Negotiation;
use App\Models\NegotiationMessage;
use App\Models\ClothingItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NegotiationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Carrega o relacionamento professional do usuário
        $user->load('professional');
        
        $negotiations = Negotiation::with([
            'clothingItem.primaryPhoto',
            'initiator',
            'recipient',
            'professional.user',
            'messages' => function($query) {
                $query->latest()->limit(1);
            }
        ])
        ->where(function($query) use ($user) {
            $query->where('initiator_id', $user->id)
                  ->orWhere('recipient_id', $user->id);
            
            // Se o usuário é profissional, inclui negociações onde ele foi adicionado
            if ($user->professional) {
                $query->orWhere('professional_id', $user->professional->id);
            }
        })
        ->orderBy('updated_at', 'desc')
        ->paginate(20);

        // Adiciona contagem de mensagens não lidas
        $negotiations->getCollection()->transform(function ($negotiation) use ($user) {
            $negotiation->unread_count = $negotiation->unreadMessagesFor($user->id);
            return $negotiation;
        });

        return response()->json([
            'success' => true,
            'data' => $negotiations
        ]);
    }

    public function show($id)
    {
        $user = request()->user();
        
        $negotiation = Negotiation::with([
            'clothingItem.photos',
            'initiator',
            'recipient',
            'rental',
            'professional.user',
            'messages.sender'
        ])
        ->where(function($query) use ($user) {
            $query->where('initiator_id', $user->id)
                  ->orWhere('recipient_id', $user->id);
            
            // Se o usuário é profissional, permite ver negociações onde ele foi adicionado
            if ($user->professional) {
                $query->orWhere('professional_id', $user->professional->id);
            }
        })
        ->findOrFail($id);

        // Marca mensagens como lidas
        $negotiation->messages()
            ->where('sender_id', '!=', $user->id)
            ->where('is_read', false)
            ->each(function($message) {
                $message->markAsRead();
            });

        return response()->json([
            'success' => true,
            'data' => $negotiation
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'clothing_item_id' => 'required|exists:clothing_items,id',
            'type' => 'required|in:rental,adjustment,general',
            'proposed_price' => 'nullable|numeric|min:0',
            'proposed_start_date' => 'required_if:type,rental|date|after_or_equal:today',
            'proposed_end_date' => 'required_if:type,rental|date|after:proposed_start_date',
            'initial_message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $item = ClothingItem::findOrFail($request->clothing_item_id);

        // Verifica se não está tentando negociar com si mesmo
        if ($item->user_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não pode negociar com você mesmo'
            ], 400);
        }

        // Cria negociação
        $negotiation = Negotiation::create([
            'clothing_item_id' => $item->id,
            'initiator_id' => $user->id,
            'recipient_id' => $item->user_id,
            'type' => $request->type,
            'proposed_price' => $request->proposed_price,
            'proposed_start_date' => $request->proposed_start_date,
            'proposed_end_date' => $request->proposed_end_date,
            'initial_message' => $request->initial_message,
        ]);

        // Cria primeira mensagem
        $negotiation->messages()->create([
            'sender_id' => $user->id,
            'message' => $request->initial_message,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Negociação iniciada com sucesso',
            'data' => $negotiation->load(['clothingItem', 'recipient'])
        ], 201);
    }

    public function sendMessage(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        $negotiation = Negotiation::where(function($query) use ($user) {
            $query->where('initiator_id', $user->id)
                  ->orWhere('recipient_id', $user->id);
            
            // Se o usuário é profissional, permite enviar mensagens nas negociações onde ele foi adicionado
            if ($user->professional) {
                $query->orWhere('professional_id', $user->professional->id);
            }
        })
        ->findOrFail($id);

        // Verifica se a negociação está ativa
        if ($negotiation->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Esta negociação não está mais ativa'
            ], 400);
        }

        $message = $negotiation->messages()->create([
            'sender_id' => $user->id,
            'message' => $request->message,
        ]);

        // Atualiza timestamp da negociação
        $negotiation->touch();

        return response()->json([
            'success' => true,
            'data' => $message->load('sender')
        ]);
    }

    public function accept(Request $request, $id)
    {
        $user = $request->user();
        
        $negotiation = Negotiation::where('recipient_id', $user->id)
            ->findOrFail($id);

        if ($negotiation->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Esta negociação não pode mais ser aceita'
            ], 400);
        }

        $negotiation->accept();

        // Se for negociação de aluguel, pode criar um Rental automaticamente
        if ($negotiation->type === 'rental' && !$negotiation->rental_id) {
            $item = $negotiation->clothingItem;
            
            $startDate = \Carbon\Carbon::parse($negotiation->proposed_start_date);
            $endDate = \Carbon\Carbon::parse($negotiation->proposed_end_date);
            $rentalDays = $startDate->diffInDays($endDate) + 1;
            
            $dailyRate = $negotiation->proposed_price ?? $item->price_per_day;
            $subtotal = $dailyRate * $rentalDays;
            $platformFee = $subtotal * 0.10;
            $totalAmount = $subtotal + $platformFee;

            $rental = \App\Models\Rental::create([
                'clothing_item_id' => $item->id,
                'renter_id' => $negotiation->initiator_id,
                'owner_id' => $item->user_id,
                'start_date' => $negotiation->proposed_start_date,
                'end_date' => $negotiation->proposed_end_date,
                'daily_rate' => $dailyRate,
                'rental_days' => $rentalDays,
                'subtotal' => $subtotal,
                'platform_fee' => $platformFee,
                'total_amount' => $totalAmount,
                'status' => 'confirmed',
                'confirmed_at' => now(),
            ]);

            $negotiation->update(['rental_id' => $rental->id]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Negociação aceita com sucesso',
            'data' => $negotiation->fresh()->load(['rental', 'clothingItem'])
        ]);
    }

    public function reject(Request $request, $id)
    {
        $user = $request->user();
        
        $negotiation = Negotiation::where('recipient_id', $user->id)
            ->findOrFail($id);

        if ($negotiation->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Esta negociação não pode mais ser rejeitada'
            ], 400);
        }

        $negotiation->reject();

        return response()->json([
            'success' => true,
            'message' => 'Negociação rejeitada'
        ]);
    }

    public function addProfessional(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'professional_id' => 'required|exists:professionals,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        $negotiation = Negotiation::where(function($query) use ($user) {
            $query->where('initiator_id', $user->id)
                  ->orWhere('recipient_id', $user->id);
        })
        ->findOrFail($id);

        // Atualiza a negociação com o profissional
        $negotiation->update([
            'professional_id' => $request->professional_id
        ]);

        // Recarrega com o relacionamento
        $negotiation->load('professional.user');

        return response()->json([
            'success' => true,
            'message' => 'Profissional adicionado à negociação',
            'data' => $negotiation
        ]);
    }

    public function confirmProfessional(Request $request, $id)
    {
        $user = $request->user();
        
        $negotiation = Negotiation::with('professional.user')
            ->where('initiator_id', $user->id) // Apenas quem iniciou pode confirmar
            ->findOrFail($id);

        if (!$negotiation->professional_id) {
            return response()->json([
                'success' => false,
                'message' => 'Nenhum profissional foi adicionado a esta negociação'
            ], 400);
        }

        if ($negotiation->professional_confirmed) {
            return response()->json([
                'success' => false,
                'message' => 'O profissional já foi confirmado anteriormente'
            ], 400);
        }

        // Confirma o profissional
        $negotiation->update([
            'professional_confirmed' => true,
            'professional_confirmed_at' => now(),
        ]);

        // TODO: Enviar notificação para o profissional

        return response()->json([
            'success' => true,
            'message' => 'Profissional confirmado com sucesso!',
            'data' => $negotiation->fresh()
        ]);
    }
}


