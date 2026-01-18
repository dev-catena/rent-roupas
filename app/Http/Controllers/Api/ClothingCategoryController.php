<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClothingCategory;
use Illuminate\Http\Request;

class ClothingCategoryController extends Controller
{
    /**
     * Lista todas as categorias ativas com seus atributos
     */
    public function index()
    {
        $categories = ClothingCategory::with('attributes')
            ->active()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Retorna uma categoria específica com seus atributos
     */
    public function show($id)
    {
        $category = ClothingCategory::with('attributes')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $category
        ]);
    }
}

