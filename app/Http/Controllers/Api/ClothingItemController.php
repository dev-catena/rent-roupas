<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClothingItem;
use App\Models\ClothingPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ClothingItemController extends Controller
{
    public function index(Request $request)
    {
        $query = ClothingItem::with(['user', 'primaryPhoto', 'photos'])
            ->available();

        // Filtros
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('gender')) {
            $query->where('gender', $request->gender);
        }

        if ($request->has('min_price')) {
            $query->where('price_per_day', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price_per_day', '<=', $request->max_price);
        }

        if ($request->has('size')) {
            $query->where('size', $request->size);
        }

        if ($request->has('shoe_size')) {
            $query->where('shoe_size', $request->shoe_size);
        }

        // Busca por texto
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        // Ordenação
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $items = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function show($id)
    {
        $item = ClothingItem::with(['user', 'photos', 'user.measurements'])
            ->findOrFail($id);

        $item->incrementViews();

        return response()->json([
            'success' => true,
            'data' => $item
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category' => 'required|in:dress,suit,shirt,pants,skirt,jacket,coat,shoes,accessory,other',
            'gender' => 'required|in:male,female,unisex',
            'color' => 'nullable|string',
            'brand' => 'nullable|string',
            'condition' => 'required|in:new,like_new,good,fair',
            'shoulder_width' => 'nullable|numeric|min:0',
            'chest' => 'nullable|numeric|min:0',
            'waist' => 'nullable|numeric|min:0',
            'hip' => 'nullable|numeric|min:0',
            'length' => 'nullable|numeric|min:0',
            'sleeve_length' => 'nullable|numeric|min:0',
            'inseam' => 'nullable|numeric|min:0',
            'size' => 'nullable|string',
            'shoe_size' => 'nullable|numeric|min:0',
            'price_per_day' => 'required|numeric|min:0',
            'available_from' => 'nullable|date',
            'available_until' => 'nullable|date|after:available_from',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $item = $request->user()->clothingItems()->create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Peça cadastrada com sucesso',
            'data' => $item->load('photos')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $item = ClothingItem::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'category' => 'sometimes|in:dress,suit,shirt,pants,skirt,jacket,coat,shoes,accessory,other',
            'gender' => 'sometimes|in:male,female,unisex',
            'color' => 'nullable|string',
            'brand' => 'nullable|string',
            'condition' => 'sometimes|in:new,like_new,good,fair',
            'price_per_day' => 'sometimes|numeric|min:0',
            'is_available' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $item->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Peça atualizada com sucesso',
            'data' => $item->load('photos')
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $item = ClothingItem::where('user_id', $request->user()->id)
            ->findOrFail($id);

        // Remove fotos
        foreach ($item->photos as $photo) {
            Storage::delete($photo->photo_path);
            $photo->delete();
        }

        $item->delete();

        return response()->json([
            'success' => true,
            'message' => 'Peça removida com sucesso'
        ]);
    }

    public function uploadPhotos(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'photos' => 'required|array|min:1|max:10',
            'photos.*' => 'image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $item = ClothingItem::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $photos = [];
        $currentOrder = $item->photos()->max('order') ?? 0;

        foreach ($request->file('photos') as $index => $photo) {
            $path = $photo->store('clothing-items', 'public');
            
            $clothingPhoto = $item->photos()->create([
                'photo_path' => $path,
                'order' => $currentOrder + $index + 1,
                'is_primary' => $item->photos()->count() === 0 && $index === 0,
            ]);

            $photos[] = $clothingPhoto;
        }

        return response()->json([
            'success' => true,
            'message' => 'Fotos enviadas com sucesso',
            'data' => $photos
        ]);
    }

    public function deletePhoto(Request $request, $photoId)
    {
        $photo = ClothingPhoto::findOrFail($photoId);
        
        $item = ClothingItem::where('user_id', $request->user()->id)
            ->where('id', $photo->clothing_item_id)
            ->firstOrFail();

        Storage::delete($photo->photo_path);
        $photo->delete();

        // Se era a foto principal, define a próxima como principal
        if ($photo->is_primary && $item->photos()->count() > 0) {
            $item->photos()->first()->update(['is_primary' => true]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Foto removida com sucesso'
        ]);
    }

    public function myItems(Request $request)
    {
        $items = ClothingItem::with(['photos', 'primaryPhoto'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $items
        ]);
    }

    public function markAsAvailable(Request $request, $id)
    {
        $item = ClothingItem::where('user_id', $request->user()->id)
            ->findOrFail($id);

        if (!$item->in_use) {
            return response()->json([
                'success' => false,
                'message' => 'Esta peça não está em uso'
            ], 400);
        }

        $item->update([
            'in_use' => false,
            'current_rental_id' => null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Peça marcada como disponível novamente',
            'data' => $item
        ]);
    }
}

