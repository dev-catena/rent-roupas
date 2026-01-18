<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\ClothingItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $query = Sale::with(['clothingItem.primaryPhoto', 'buyer', 'seller']);

        // Filtros
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtra por comprador ou vendedor
        if ($request->has('buyer_id')) {
            $query->where('buyer_id', $request->buyer_id);
        }

        if ($request->has('seller_id')) {
            $query->where('seller_id', $request->seller_id);
        }

        $sales = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $sales
        ]);
    }

    public function show($id)
    {
        $sale = Sale::with([
            'clothingItem.photos',
            'clothingItem.user',
            'buyer',
            'seller'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $sale
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'clothing_item_id' => 'required|exists:clothing_items,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $item = ClothingItem::findOrFail($request->clothing_item_id);
        $user = $request->user();

        // Verifica se o item está à venda
        if (!$item->is_for_sale) {
            return response()->json([
                'success' => false,
                'message' => 'Este item não está disponível para venda'
            ], 400);
        }

        // Verifica se o usuário está tentando comprar sua própria peça
        if ($item->user_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não pode comprar sua própria peça'
            ], 400);
        }

        // Verifica se o item está disponível
        if (!$item->is_available) {
            return response()->json([
                'success' => false,
                'message' => 'Este item não está disponível'
            ], 400);
        }

        // Verifica se já existe uma venda pendente para este item
        $existingSale = Sale::where('clothing_item_id', $item->id)
            ->whereIn('status', ['pending', 'confirmed', 'paid'])
            ->first();

        if ($existingSale) {
            return response()->json([
                'success' => false,
                'message' => 'Este item já possui uma venda em andamento'
            ], 400);
        }

        // Calcula valores
        $platformFee = $item->sale_price * 0.10;
        $totalAmount = $item->sale_price + $platformFee;

        // Cria a venda
        $sale = Sale::create([
            'clothing_item_id' => $item->id,
            'buyer_id' => $user->id,
            'seller_id' => $item->user_id,
            'sale_price' => $item->sale_price,
            'platform_fee' => $platformFee,
            'total_amount' => $totalAmount,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Solicitação de compra criada com sucesso',
            'data' => $sale->load(['clothingItem', 'buyer', 'seller'])
        ], 201);
    }

    public function confirm(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        $user = $request->user();

        // Verifica se o usuário é o vendedor
        if ($sale->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas o vendedor pode confirmar a venda'
            ], 403);
        }

        if ($sale->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Esta venda não pode ser confirmada'
            ], 400);
        }

        $sale->confirm();

        return response()->json([
            'success' => true,
            'message' => 'Venda confirmada com sucesso',
            'data' => $sale->load(['clothingItem', 'buyer', 'seller'])
        ]);
    }

    public function cancel(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        $user = $request->user();

        // Verifica se o usuário é o comprador ou vendedor
        if ($sale->buyer_id !== $user->id && $sale->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Você não tem permissão para cancelar esta venda'
            ], 403);
        }

        if (!in_array($sale->status, ['pending', 'confirmed'])) {
            return response()->json([
                'success' => false,
                'message' => 'Esta venda não pode ser cancelada'
            ], 400);
        }

        $sale->cancel($request->cancellation_reason);

        return response()->json([
            'success' => true,
            'message' => 'Venda cancelada com sucesso',
            'data' => $sale
        ]);
    }

    public function markAsPaid(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        $user = $request->user();

        // Verifica se o usuário é o comprador
        if ($sale->buyer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas o comprador pode marcar como pago'
            ], 403);
        }

        if ($sale->status !== 'confirmed') {
            return response()->json([
                'success' => false,
                'message' => 'Esta venda precisa estar confirmada para ser marcada como paga'
            ], 400);
        }

        $sale->markAsPaid($request->payment_method);

        return response()->json([
            'success' => true,
            'message' => 'Pagamento registrado com sucesso',
            'data' => $sale->load(['clothingItem', 'buyer', 'seller'])
        ]);
    }

    public function markAsDelivered(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        $user = $request->user();

        // Verifica se o usuário é o vendedor
        if ($sale->seller_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas o vendedor pode marcar como entregue'
            ], 403);
        }

        if ($sale->status !== 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Esta venda precisa estar paga para ser marcada como entregue'
            ], 400);
        }

        $sale->markAsDelivered();

        return response()->json([
            'success' => true,
            'message' => 'Entrega registrada com sucesso',
            'data' => $sale->load(['clothingItem', 'buyer', 'seller'])
        ]);
    }

    public function complete(Request $request, $id)
    {
        $sale = Sale::findOrFail($id);
        $user = $request->user();

        // Verifica se o usuário é o comprador
        if ($sale->buyer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Apenas o comprador pode finalizar a venda'
            ], 403);
        }

        if ($sale->status !== 'delivered') {
            return response()->json([
                'success' => false,
                'message' => 'Esta venda precisa estar entregue para ser finalizada'
            ], 400);
        }

        $sale->complete();

        return response()->json([
            'success' => true,
            'message' => 'Venda finalizada com sucesso',
            'data' => $sale->load(['clothingItem', 'buyer', 'seller'])
        ]);
    }
}
