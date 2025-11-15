<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClothingItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class VirtualTryOnController extends Controller
{
    private $replicateApiKey;
    private $replicateApiUrl = 'https://api.replicate.com/v1/predictions';

    public function __construct()
    {
        $this->replicateApiKey = env('REPLICATE_API_KEY');
    }

    public function tryOn(Request $request)
    {
        \Log::info('Virtual Try-On: Iniciando requisição', [
            'user_id' => $request->user()->id ?? null,
            'clothing_item_id' => $request->clothing_item_id ?? null,
            'has_photo' => $request->hasFile('user_photo'),
        ]);

        $validator = Validator::make($request->all(), [
            'clothing_item_id' => 'required|exists:clothing_items,id',
            'user_photo' => 'required|image|mimes:jpeg,png,jpg|max:10240', // Max 10MB
        ]);

        if ($validator->fails()) {
            \Log::error('Virtual Try-On: Validação falhou', [
                'errors' => $validator->errors()->toArray()
            ]);
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();
            $item = ClothingItem::with('primaryPhoto')->findOrFail($request->clothing_item_id);
            
            \Log::info('Virtual Try-On: Item encontrado', [
                'item_id' => $item->id,
                'has_primary_photo' => $item->primaryPhoto !== null
            ]);

            // Verifica se a peça tem foto
            if (!$item->primaryPhoto) {
                return response()->json([
                    'success' => false,
                    'message' => 'Esta peça não possui foto para experimentação virtual'
                ], 400);
            }

            // Faz upload da foto do usuário
            $userPhotoPath = $request->file('user_photo')->store('virtual-tryon/users', 'public');
            
            // Converte imagens para base64 data URI
            $userPhotoFullPath = Storage::disk('public')->path($userPhotoPath);
            $userPhotoBase64 = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($userPhotoFullPath));
            
            $clothingPhotoFullPath = Storage::disk('public')->path($item->primaryPhoto->photo_path);
            $clothingPhotoBase64 = 'data:image/jpeg;base64,' . base64_encode(file_get_contents($clothingPhotoFullPath));
            
            \Log::info('Virtual Try-On: Imagens convertidas para base64', [
                'user_photo_size' => strlen($userPhotoBase64),
                'clothing_photo_size' => strlen($clothingPhotoBase64)
            ]);

            // Chama API do Replicate
            \Log::info('Virtual Try-On: Chamando API Replicate');
            
            $response = Http::timeout(60)->withHeaders([
                'Authorization' => 'Token ' . $this->replicateApiKey,
                'Content-Type' => 'application/json',
            ])->post($this->replicateApiUrl, [
                'version' => 'c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4', // IDM-VTON model
                'input' => [
                    'human_img' => $userPhotoBase64,
                    'garm_img' => $clothingPhotoBase64,
                    'garment_des' => $item->title,
                    'is_checked' => true,
                    'is_checked_crop' => false,
                    'denoise_steps' => 30,
                    'seed' => random_int(1, 999999),
                ]
            ]);

            if (!$response->successful()) {
                \Log::error('Replicate API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'headers' => $response->headers()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Erro ao processar imagem: ' . $response->body()
                ], 500);
            }

            $prediction = $response->json();
            
            \Log::info('Virtual Try-On: Resposta Replicate', [
                'prediction_id' => $prediction['id'] ?? null,
                'status' => $prediction['status'] ?? null
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Processamento iniciado',
                'data' => [
                    'prediction_id' => $prediction['id'],
                    'status' => $prediction['status'],
                    'urls' => $prediction['urls'] ?? null,
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Virtual Try-On Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao processar experimentação virtual: ' . $e->getMessage()
            ], 500);
        }
    }

    public function checkStatus(Request $request, $predictionId)
    {
        try {
            \Log::info('Check Status: Iniciando', [
                'prediction_id' => $predictionId,
                'replicate_url' => $this->replicateApiUrl . '/' . $predictionId
            ]);
            
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Token ' . $this->replicateApiKey,
            ])->get($this->replicateApiUrl . '/' . $predictionId);

            if (!$response->successful()) {
                \Log::error('Check Status API Error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                
                return response()->json([
                    'success' => false,
                    'message' => 'Erro ao verificar status na API Replicate'
                ], 500);
            }

            $prediction = $response->json();
            
            \Log::info('Check Status Response', [
                'prediction_id' => $predictionId,
                'status' => $prediction['status'] ?? null,
                'has_error' => isset($prediction['error'])
            ]);

            $result = [
                'success' => true,
                'data' => [
                    'id' => $prediction['id'],
                    'status' => $prediction['status'],
                    'output' => $prediction['output'] ?? null,
                    'error' => $prediction['error'] ?? null,
                ]
            ];

            // Se completou, salva a imagem localmente
            if ($prediction['status'] === 'succeeded' && isset($prediction['output'])) {
                // Output pode ser array ou string
                $outputUrl = is_array($prediction['output']) ? $prediction['output'][0] : $prediction['output'];
                
                \Log::info('Downloading result image', ['url' => $outputUrl, 'output_type' => gettype($prediction['output'])]);
                
                // Valida URL antes de baixar
                if (filter_var($outputUrl, FILTER_VALIDATE_URL)) {
                    try {
                        // Baixa a imagem gerada
                        $imageContent = Http::timeout(60)->get($outputUrl)->body();
                        $filename = 'virtual-tryon/results/' . uniqid() . '.png';
                        Storage::disk('public')->put($filename, $imageContent);
                        
                        $result['data']['local_url'] = url(Storage::url($filename));
                        
                        \Log::info('Image saved locally', ['url' => $result['data']['local_url']]);
                    } catch (\Exception $e) {
                        \Log::error('Failed to download result image', [
                            'error' => $e->getMessage(),
                            'url' => $outputUrl
                        ]);
                        // Não falha a requisição, apenas não salva localmente
                        $result['data']['output_url'] = $outputUrl;
                    }
                } else {
                    \Log::warning('Invalid output URL', ['url' => $outputUrl]);
                    $result['data']['output_url'] = $outputUrl;
                }
            }
            
            // Se falhou, loga o erro
            if ($prediction['status'] === 'failed' && isset($prediction['error'])) {
                \Log::error('Replicate Processing Failed', [
                    'prediction_id' => $predictionId,
                    'error' => $prediction['error']
                ]);
            }

            return response()->json($result);

        } catch (\Exception $e) {
            \Log::error('Check Status Error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Erro ao verificar status: ' . $e->getMessage()
            ], 500);
        }
    }

    public function history(Request $request)
    {
        try {
            // Lista os arquivos de resultados do usuário
            $userId = $request->user()->id;
            $files = Storage::disk('public')->files('virtual-tryon/results');
            
            $results = [];
            foreach ($files as $file) {
                $results[] = [
                    'url' => url(Storage::url($file)),
                    'created_at' => Storage::disk('public')->lastModified($file),
                ];
            }

            // Ordena por data (mais recentes primeiro)
            usort($results, function($a, $b) {
                return $b['created_at'] - $a['created_at'];
            });

            return response()->json([
                'success' => true,
                'data' => array_slice($results, 0, 20) // Últimos 20
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erro ao carregar histórico'
            ], 500);
        }
    }
}

