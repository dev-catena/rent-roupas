<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserMeasurement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function profile(Request $request)
    {
        $user = $request->user()->load('measurements', 'professional');

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'user_type' => 'sometimes|in:renter,owner,professional,both',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string',
            'state' => 'sometimes|string',
            'zipcode' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $user->update($request->only([
            'name', 'phone', 'user_type', 'latitude', 'longitude',
            'address', 'city', 'state', 'zipcode'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Perfil atualizado com sucesso',
            'data' => $user
        ]);
    }

    public function updateMeasurements(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'weight' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'shoulder_width' => 'nullable|numeric|min:0',
            'chest' => 'nullable|numeric|min:0',
            'waist' => 'nullable|numeric|min:0',
            'hip' => 'nullable|numeric|min:0',
            'inseam' => 'nullable|numeric|min:0',
            'arm_length' => 'nullable|numeric|min:0',
            'leg_length' => 'nullable|numeric|min:0',
            'neck' => 'nullable|numeric|min:0',
            'shirt_size' => 'nullable|string',
            'pants_size' => 'nullable|string',
            'dress_size' => 'nullable|string',
            'shoe_size' => 'nullable|numeric|min:0',
            'gender' => 'nullable|in:male,female,unisex,other',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        $measurements = $user->measurements()->updateOrCreate(
            ['user_id' => $user->id],
            $request->all()
        );

        return response()->json([
            'success' => true,
            'message' => 'Medidas atualizadas com sucesso',
            'data' => $measurements
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        // Remove avatar antigo se existir
        if ($user->avatar) {
            Storage::delete($user->avatar);
        }

        // Salva novo avatar
        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'success' => true,
            'message' => 'Avatar atualizado com sucesso',
            'data' => [
                'avatar' => $user->avatar,
                'avatar_url' => Storage::url($path)
            ]
        ]);
    }
}

