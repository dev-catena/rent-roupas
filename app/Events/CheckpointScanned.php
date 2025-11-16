<?php

namespace App\Events;

use App\Models\QRCodeCheckpoint;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CheckpointScanned implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $checkpoint;
    public $negotiationId;

    public function __construct(QRCodeCheckpoint $checkpoint)
    {
        $this->checkpoint = $checkpoint;
        $this->negotiationId = $checkpoint->negotiation_id;
    }

    public function broadcastOn()
    {
        // Canal privado por negociação
        return new Channel('negotiation.' . $this->negotiationId);
    }

    public function broadcastAs()
    {
        return 'checkpoint.scanned';
    }

    public function broadcastWith()
    {
        return [
            'checkpoint_id' => $this->checkpoint->id,
            'type' => $this->checkpoint->type,
            'status' => $this->checkpoint->status,
            'scanned_at' => $this->checkpoint->scanned_at,
            'scanned_by_user_id' => $this->checkpoint->scanned_by_user_id,
            'negotiation_id' => $this->negotiationId,
        ];
    }
}
