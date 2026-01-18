<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QRCodeCheckpoint;
use App\Models\Negotiation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class QRCodeController extends Controller
{
    // Gera QR Code para entrega da peça à costureira
    public function generateDeliveryToProfessional(Request $request, $negotiationId)
    {
        $user = $request->user();
        
        $negotiation = Negotiation::with(['professional', 'initiator', 'recipient'])
            ->where('initiator_id', $user->id) // Apenas quem alugou pode gerar
            ->findOrFail($negotiationId);

        // Verifica se o profissional foi confirmado
        if (!$negotiation->professional_confirmed) {
            return response()->json([
                'success' => false,
                'message' => 'O profissional precisa ser confirmado antes de gerar o QR Code'
            ], 400);
        }

        // Verifica se já existe um checkpoint pendente ou escaneado
        $existingCheckpoint = $negotiation->checkpoints()
            ->where('type', 'delivery_to_professional')
            ->first();

        if ($existingCheckpoint) {
            return response()->json([
                'success' => true,
                'message' => 'QR Code já existe',
                'data' => $existingCheckpoint
            ]);
        }

        // Gera novo checkpoint
        $checkpoint = QRCodeCheckpoint::generateQRCode(
            $negotiationId,
            'delivery_to_professional',
            $user->id
        );

        return response()->json([
            'success' => true,
            'message' => 'QR Code gerado com sucesso',
            'data' => $checkpoint
        ], 201);
    }

    // Gera QR Code para devolução da peça pela costureira
    public function generateReturnFromProfessional(Request $request, $negotiationId)
    {
        $user = $request->user();
        $user->load('professional'); // Carrega o relacionamento professional
        
        $negotiation = Negotiation::with(['professional', 'initiator'])
            ->where('professional_id', $user->professional->id) // Apenas o profissional pode gerar
            ->findOrFail($negotiationId);

        // Verifica se a peça foi recebida pelo profissional
        $deliveryCheckpoint = $negotiation->checkpoints()
            ->where('type', 'delivery_to_professional')
            ->where('status', 'scanned')
            ->first();

        if (!$deliveryCheckpoint) {
            return response()->json([
                'success' => false,
                'message' => 'A peça ainda não foi recebida pelo profissional'
            ], 400);
        }

        // Verifica se já existe um checkpoint
        $existingCheckpoint = $negotiation->checkpoints()
            ->where('type', 'return_from_professional')
            ->first();

        if ($existingCheckpoint) {
            return response()->json([
                'success' => true,
                'message' => 'QR Code já existe',
                'data' => $existingCheckpoint
            ]);
        }

        // Gera novo checkpoint
        $checkpoint = QRCodeCheckpoint::generateQRCode(
            $negotiationId,
            'return_from_professional',
            $user->id
        );

        return response()->json([
            'success' => true,
            'message' => 'QR Code gerado com sucesso',
            'data' => $checkpoint
        ], 201);
    }

    // Gera QR Code para devolução da peça ao dono
    public function generateReturnToOwner(Request $request, $negotiationId)
    {
        $user = $request->user();
        
        $negotiation = Negotiation::with(['initiator', 'recipient'])
            ->where('initiator_id', $user->id) // Quem alugou devolve
            ->findOrFail($negotiationId);

        // Verifica se a peça foi devolvida pelo profissional (se tiver profissional)
        if ($negotiation->professional_id) {
            $returnCheckpoint = $negotiation->checkpoints()
                ->where('type', 'return_from_professional')
                ->where('status', 'scanned')
                ->first();

            if (!$returnCheckpoint) {
                return response()->json([
                    'success' => false,
                    'message' => 'A peça ainda não foi devolvida pelo profissional'
                ], 400);
            }
        }

        // Verifica se já existe um checkpoint
        $existingCheckpoint = $negotiation->checkpoints()
            ->where('type', 'return_to_owner')
            ->first();

        if ($existingCheckpoint) {
            return response()->json([
                'success' => true,
                'message' => 'QR Code já existe',
                'data' => $existingCheckpoint
            ]);
        }

        // Gera novo checkpoint
        $checkpoint = QRCodeCheckpoint::generateQRCode(
            $negotiationId,
            'return_to_owner',
            $user->id
        );

        return response()->json([
            'success' => true,
            'message' => 'QR Code gerado com sucesso',
            'data' => $checkpoint
        ], 201);
    }

    // Escaneia/valida um QR Code
    public function scanQRCode(Request $request)
    {
        // Limpa e normaliza o QR code (remove espaços, quebras de linha, etc)
        $qrCode = $request->input('qr_code');
        if ($qrCode) {
            $qrCode = trim($qrCode);
            // Remove qualquer caractere de controle ou espaços extras
            $qrCode = preg_replace('/\s+/', '', $qrCode);
        }

        // Log para debug
        \Log::info('QR Code scan request', [
            'qr_code_received' => $request->has('qr_code') ? (strlen($request->qr_code) > 0 ? 'present' : 'empty') : 'missing',
            'qr_code_original_length' => $request->has('qr_code') ? strlen($request->qr_code) : 0,
            'qr_code_cleaned_length' => $qrCode ? strlen($qrCode) : 0,
            'qr_code_cleaned' => $qrCode ? substr($qrCode, 0, 50) . '...' : 'empty',
        ]);

        $validator = Validator::make([
            'qr_code' => $qrCode,
            'notes' => $request->input('notes'),
        ], [
            'qr_code' => 'required|string|min:1',
            'notes' => 'nullable|string|max:500',
        ], [
            'qr_code.required' => 'O código QR é obrigatório',
            'qr_code.string' => 'O código QR deve ser uma string',
            'qr_code.min' => 'O código QR não pode estar vazio',
        ]);

        if ($validator->fails()) {
            \Log::warning('QR Code validation failed', [
                'errors' => $validator->errors()->toArray(),
                'qr_code_received' => $request->input('qr_code'),
                'qr_code_cleaned' => $qrCode,
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Dados inválidos',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $user->load('professional'); // Carrega o relacionamento professional
        
        $checkpoint = QRCodeCheckpoint::with(['negotiation', 'generatedBy'])
            ->where('qr_code', $qrCode)
            ->first();

        if (!$checkpoint) {
            return response()->json([
                'success' => false,
                'message' => 'QR Code inválido'
            ], 404);
        }

        // Verifica se já foi escaneado
        if ($checkpoint->status === 'scanned') {
            return response()->json([
                'success' => false,
                'message' => 'Este QR Code já foi utilizado',
                'data' => $checkpoint
            ], 400);
        }

        // Verifica se o usuário tem permissão para escanear
        $negotiation = $checkpoint->negotiation;
        
        if (!$negotiation) {
            return response()->json([
                'success' => false,
                'message' => 'Negociação não encontrada para este QR Code'
            ], 404);
        }
        
        $canScan = false;

        switch ($checkpoint->type) {
            case 'delivery_to_professional':
                // Profissional da negociação pode escanear
                \Log::info('Verificando permissão delivery_to_professional', [
                    'negotiation_professional_id' => $negotiation->professional_id,
                    'user_professional_id' => $user->professional?->id,
                    'user_id' => $user->id,
                    'has_professional' => $user->professional !== null
                ]);
                
                if ($user->professional && $negotiation->professional_id === $user->professional->id) {
                    $canScan = true;
                }
                break;
            
            case 'return_from_professional':
                // Quem alugou pode escanear
                $canScan = $negotiation->initiator_id === $user->id;
                break;
            
            case 'return_to_owner':
                // Dono da peça pode escanear
                $canScan = $negotiation->recipient_id === $user->id;
                break;
            
            case 'delivery_to_renter':
                // Proprietário pode escanear para confirmar entrega ao locatário
                $canScan = $negotiation->recipient_id === $user->id;
                break;
        }

        if (!$canScan) {
            return response()->json([
                'success' => false,
                'message' => 'Você não tem permissão para escanear este QR Code',
                'debug' => [
                    'checkpoint_type' => $checkpoint->type,
                    'user_id' => $user->id,
                    'user_professional_id' => $user->professional?->id,
                    'negotiation_professional_id' => $negotiation->professional_id,
                    'negotiation_initiator_id' => $negotiation->initiator_id,
                    'negotiation_recipient_id' => $negotiation->recipient_id
                ]
            ], 403);
        }

        // Marca como escaneado
        $checkpoint->markAsScanned($user->id, $request->notes);
        
        // Se for entrega ao locatário, marca o aluguel como ready (pronto para retirada)
        if ($checkpoint->type === 'delivery_to_renter') {
            try {
                $rental = \App\Models\Rental::where('negotiation_id', $negotiation->id)->first();
                if ($rental && $rental->status !== 'ready') {
                    $rental->markAsReady();
                }
            } catch (\Exception $e) {
                \Log::error('Erro ao atualizar status do aluguel após escanear QR Code', [
                    'error' => $e->getMessage(),
                    'negotiation_id' => $negotiation->id,
                    'checkpoint_id' => $checkpoint->id
                ]);
                // Não falha o escaneamento se houver erro ao atualizar o aluguel
            }
        }
        
        // Dispara evento de broadcast
        event(new \App\Events\CheckpointScanned($checkpoint->fresh()));

        return response()->json([
            'success' => true,
            'message' => 'QR Code escaneado com sucesso!',
            'data' => $checkpoint->fresh()
        ]);
    }

    // Lista todos os checkpoints de uma negociação
    public function getCheckpoints($negotiationId)
    {
        $checkpoints = QRCodeCheckpoint::with(['generatedBy', 'scannedBy'])
            ->where('negotiation_id', $negotiationId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $checkpoints
        ]);
    }
}
