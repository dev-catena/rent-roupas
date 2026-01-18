<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ClothingCategory;
use App\Models\ClothingCategoryAttribute;

class ClothingCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Vestido',
                'slug' => 'dress',
                'icon' => '👗',
                'description' => 'Vestidos de diversos estilos',
                'order' => 1,
                'attributes' => [
                    ['attribute_name' => 'size', 'label' => 'Tamanho', 'type' => 'string', 'unit' => null, 'placeholder' => 'P, M, G, GG', 'order' => 1, 'is_required' => false],
                    ['attribute_name' => 'chest', 'label' => 'Busto', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '90', 'order' => 2, 'is_required' => false],
                    ['attribute_name' => 'waist', 'label' => 'Cintura', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '75', 'order' => 3, 'is_required' => false],
                    ['attribute_name' => 'hip', 'label' => 'Quadril', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '95', 'order' => 4, 'is_required' => false],
                    ['attribute_name' => 'length', 'label' => 'Comprimento', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '120', 'order' => 5, 'is_required' => false],
                ],
            ],
            [
                'name' => 'Calça',
                'slug' => 'pants',
                'icon' => '👖',
                'description' => 'Calças e bermudas',
                'order' => 2,
                'attributes' => [
                    ['attribute_name' => 'size', 'label' => 'Tamanho', 'type' => 'string', 'unit' => null, 'placeholder' => '38, 40, 42', 'order' => 1, 'is_required' => false],
                    ['attribute_name' => 'waist', 'label' => 'Cintura', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '75', 'order' => 2, 'is_required' => false],
                    ['attribute_name' => 'hip', 'label' => 'Quadril', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '95', 'order' => 3, 'is_required' => false],
                    ['attribute_name' => 'inseam', 'label' => 'Altura da Cava', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '80', 'order' => 4, 'is_required' => false],
                    ['attribute_name' => 'length', 'label' => 'Comprimento', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '100', 'order' => 5, 'is_required' => false],
                ],
            ],
            [
                'name' => 'Camisa',
                'slug' => 'shirt',
                'icon' => '👔',
                'description' => 'Camisas sociais e casuais',
                'order' => 3,
                'attributes' => [
                    ['attribute_name' => 'size', 'label' => 'Tamanho', 'type' => 'string', 'unit' => null, 'placeholder' => 'P, M, G, GG', 'order' => 1, 'is_required' => false],
                    ['attribute_name' => 'shoulder_width', 'label' => 'Largura do Ombro', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '42', 'order' => 2, 'is_required' => false],
                    ['attribute_name' => 'chest', 'label' => 'Busto/Peito', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '100', 'order' => 3, 'is_required' => false],
                    ['attribute_name' => 'sleeve_length', 'label' => 'Comprimento da Manga', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '60', 'order' => 4, 'is_required' => false],
                    ['attribute_name' => 'length', 'label' => 'Comprimento', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '70', 'order' => 5, 'is_required' => false],
                ],
            ],
            [
                'name' => 'Sapato',
                'slug' => 'shoes',
                'icon' => '👠',
                'description' => 'Sapatos e tênis',
                'order' => 4,
                'attributes' => [
                    ['attribute_name' => 'shoe_size', 'label' => 'Número', 'type' => 'decimal', 'unit' => null, 'placeholder' => '38', 'order' => 1, 'is_required' => false],
                ],
            ],
            [
                'name' => 'Saia',
                'slug' => 'skirt',
                'icon' => '👗',
                'description' => 'Saias de diversos estilos',
                'order' => 5,
                'attributes' => [
                    ['attribute_name' => 'size', 'label' => 'Tamanho', 'type' => 'string', 'unit' => null, 'placeholder' => 'P, M, G', 'order' => 1, 'is_required' => false],
                    ['attribute_name' => 'waist', 'label' => 'Cintura', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '75', 'order' => 2, 'is_required' => false],
                    ['attribute_name' => 'hip', 'label' => 'Quadril', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '95', 'order' => 3, 'is_required' => false],
                    ['attribute_name' => 'length', 'label' => 'Comprimento', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '60', 'order' => 4, 'is_required' => false],
                ],
            ],
            [
                'name' => 'Blazer',
                'slug' => 'blazer',
                'icon' => '🧥',
                'description' => 'Blazers e casacos',
                'order' => 6,
                'attributes' => [
                    ['attribute_name' => 'size', 'label' => 'Tamanho', 'type' => 'string', 'unit' => null, 'placeholder' => 'P, M, G, GG', 'order' => 1, 'is_required' => false],
                    ['attribute_name' => 'shoulder_width', 'label' => 'Largura do Ombro', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '42', 'order' => 2, 'is_required' => false],
                    ['attribute_name' => 'chest', 'label' => 'Peito', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '100', 'order' => 3, 'is_required' => false],
                    ['attribute_name' => 'sleeve_length', 'label' => 'Comprimento da Manga', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '60', 'order' => 4, 'is_required' => false],
                    ['attribute_name' => 'length', 'label' => 'Comprimento', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '70', 'order' => 5, 'is_required' => false],
                ],
            ],
            [
                'name' => 'Terno',
                'slug' => 'suit',
                'icon' => '🤵',
                'description' => 'Ternos completos',
                'order' => 7,
                'attributes' => [
                    ['attribute_name' => 'size', 'label' => 'Tamanho', 'type' => 'string', 'unit' => null, 'placeholder' => 'P, M, G, GG', 'order' => 1, 'is_required' => false],
                    ['attribute_name' => 'shoulder_width', 'label' => 'Largura do Ombro', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '42', 'order' => 2, 'is_required' => false],
                    ['attribute_name' => 'chest', 'label' => 'Peito', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '100', 'order' => 3, 'is_required' => false],
                    ['attribute_name' => 'waist', 'label' => 'Cintura', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '85', 'order' => 4, 'is_required' => false],
                    ['attribute_name' => 'sleeve_length', 'label' => 'Comprimento da Manga', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '60', 'order' => 5, 'is_required' => false],
                    ['attribute_name' => 'length', 'label' => 'Comprimento', 'type' => 'decimal', 'unit' => 'cm', 'placeholder' => '70', 'order' => 6, 'is_required' => false],
                ],
            ],
            [
                'name' => 'Acessório',
                'slug' => 'accessory',
                'icon' => '👜',
                'description' => 'Bolsas, cintos, joias e outros acessórios',
                'order' => 8,
                'attributes' => [
                    ['attribute_name' => 'size', 'label' => 'Tamanho', 'type' => 'string', 'unit' => null, 'placeholder' => 'Pequeno, Médio, Grande', 'order' => 1, 'is_required' => false],
                ],
            ],
        ];

        foreach ($categories as $categoryData) {
            $attributes = $categoryData['attributes'];
            unset($categoryData['attributes']);

            $category = ClothingCategory::create($categoryData);

            foreach ($attributes as $attribute) {
                ClothingCategoryAttribute::create(array_merge($attribute, [
                    'clothing_category_id' => $category->id,
                ]));
            }
        }
    }
}

