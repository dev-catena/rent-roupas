<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Negotiation;
use App\Models\QRCodeCheckpoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class NegotiationUpdatesController extends Controller
{
    // Endpoint de long-polling para atualizações
    public function poll(Request $request, $negotiationId)
    {
        $user = $request->user();
        $lastCheckpointId = $request->query('last_checkpoint_id', 0);
        
        // Verifica permissão
        $negotiation = Negotiation::where(function($query) use ($user) {
            $query->where('initiator_id', $user->id)
                  ->orWhere('recipient_id', $user->id);
            if ($user->professional) {
                $query->orWhere('professional_id', $user->professional->id);
            }
        })->findOrFail($negotiationId);

        // Long-polling: aguarda até 25 segundos por novas atualizações
        $timeout = 25;
        $start = time();
        
        while ((time() - $start) < $timeout) {
            // Busca novos checkpoints
            $newCheckpoints = QRCodeCheckpoint::where('negotiation_id', $negotiationId)
                ->where('id', '>', $lastCheckpointId)
                ->with(['generatedBy', 'scannedBy'])
                ->get();

            if ($newCheckpoints->isNotEmpty()) {
                return response()->json([
                    'success' => true,
                    'has_updates' => true,
                    'checkpoints' => $newCheckpoints,
                    'negotiation' => $negotiation->load(['professional.user', 'initiator', 'recipient'])
                ]);
            }

            // Verifica mudanças na negociação
            $negotiation->refresh();
            $cacheKey = "negotiation_updated_{$negotiationId}";
            $lastUpdate = Cache::get($cacheKey);
            
            if ($lastUpdate && $lastUpdate > $start) {
                return response()->json([
                    'success' => true,
                    'has_updates' => true,
                    'checkpoints' => [],
                    'negotiation' => $negotiation->load(['professional.user', 'initiator', 'recipient'])
                ]);
            }

            // Aguarda 2 segundos antes de checar novamente
            sleep(2);
        }

        // Timeout: sem atualizações
        return response()->json([
            'success' => true,
            'has_updates' => false,
            'message' => 'Sem atualizações'
        ]);
    }

    // Endpoint rápido para verificar se há atualizações (sem long-polling)
    public function checkUpdates(Request $request, $negotiationId)
    {
        $user = $request->user();
        $lastCheckpointId = $request->query('last_checkpoint_id', 0);
        
        // Verifica permissão
        $negotiation = Negotiation::where(function($query) use ($user) {
            $query->where('initiator_id', $user->id)
                  ->orWhere('recipient_id', $user->id);
            if ($user->professional) {
                $query->orWhere('professional_id', $user->professional->id);
            }
        })->findOrFail($negotiationId);

        // Busca novos checkpoints
        $newCheckpoints = QRCodeCheckpoint::where('negotiation_id', $negotiationId)
            ->where('id', '>', $lastCheckpointId)
            ->with(['generatedBy', 'scannedBy'])
            ->get();

        return response()->json([
            'success' => true,
            'has_updates' => $newCheckpoints->isNotEmpty(),
            'checkpoints' => $newCheckpoints,
            'negotiation' => $negotiation->load(['professional.user', 'initiator', 'recipient'])
        ]);
    }
}
