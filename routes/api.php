<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ClothingItemController;
use App\Http\Controllers\Api\RentalController;
use App\Http\Controllers\Api\ProfessionalController;
use App\Http\Controllers\Api\NegotiationController;
use App\Http\Controllers\Api\MatchingController;
use App\Http\Controllers\Api\VirtualTryOnController;
use App\Http\Controllers\Api\QRCodeController;

// Rotas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);

// Rotas de busca pública
Route::get('/clothing-items', [ClothingItemController::class, 'index']);
Route::get('/clothing-items/{id}', [ClothingItemController::class, 'show']);

// Rotas protegidas por autenticação
Route::middleware('auth:sanctum')->group(function () {
    // Autenticação
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Perfil do usuário
    Route::get('/user/profile', [UserController::class, 'profile']);
    Route::put('/user/profile', [UserController::class, 'updateProfile']);
    Route::put('/user/measurements', [UserController::class, 'updateMeasurements']);
    Route::post('/user/avatar', [UserController::class, 'uploadAvatar']);
    
    // Peças de roupa
    Route::post('/clothing-items', [ClothingItemController::class, 'store']);
    Route::put('/clothing-items/{id}', [ClothingItemController::class, 'update']);
    Route::delete('/clothing-items/{id}', [ClothingItemController::class, 'destroy']);
    Route::post('/clothing-items/{id}/photos', [ClothingItemController::class, 'uploadPhotos']);
    Route::delete('/clothing-items/photos/{photoId}', [ClothingItemController::class, 'deletePhoto']);
    Route::get('/my-items', [ClothingItemController::class, 'myItems']);
    
    // Matching/Recomendações
    Route::post('/matching/search', [MatchingController::class, 'search']);
    Route::get('/matching/recommendations', [MatchingController::class, 'recommendations']);
    
    // Aluguéis/Reservas
    Route::get('/rentals', [RentalController::class, 'index']);
    Route::post('/rentals', [RentalController::class, 'store']);
    Route::get('/rentals/{id}', [RentalController::class, 'show']);
    Route::put('/rentals/{id}/status', [RentalController::class, 'updateStatus']);
    Route::get('/my-rentals', [RentalController::class, 'myRentals']);
    Route::get('/my-lendings', [RentalController::class, 'myLendings']);
    
    // Profissionais (alfaiates, costureiros)
    Route::get('/professionals', [ProfessionalController::class, 'index']);
    Route::post('/professionals/register', [ProfessionalController::class, 'registerAsProfessional']);
    Route::put('/professionals/profile', [ProfessionalController::class, 'updateProfile']);
    Route::get('/professionals/{id}', [ProfessionalController::class, 'show']);
    
    // Negociações/Chat
    Route::get('/negotiations', [NegotiationController::class, 'index']);
    Route::post('/negotiations', [NegotiationController::class, 'store']);
    Route::get('/negotiations/{id}', [NegotiationController::class, 'show']);
    Route::post('/negotiations/{id}/messages', [NegotiationController::class, 'sendMessage']);
    Route::put('/negotiations/{id}/accept', [NegotiationController::class, 'accept']);
    Route::put('/negotiations/{id}/reject', [NegotiationController::class, 'reject']);
    Route::put('/negotiations/{id}/professional', [NegotiationController::class, 'addProfessional']);
    Route::put('/negotiations/{id}/confirm-professional', [NegotiationController::class, 'confirmProfessional']);
    
    // QR Codes / Tracking
    Route::post('/negotiations/{id}/qrcode/delivery-to-professional', [QRCodeController::class, 'generateDeliveryToProfessional']);
    Route::post('/negotiations/{id}/qrcode/return-from-professional', [QRCodeController::class, 'generateReturnFromProfessional']);
    Route::post('/negotiations/{id}/qrcode/return-to-owner', [QRCodeController::class, 'generateReturnToOwner']);
    Route::post('/qrcode/scan', [QRCodeController::class, 'scanQRCode']);
    Route::get('/negotiations/{id}/checkpoints', [QRCodeController::class, 'getCheckpoints']);
    
    // Virtual Try-On
    Route::post('/virtual-try-on', [VirtualTryOnController::class, 'tryOn']);
    Route::get('/virtual-try-on/status/{predictionId}', [VirtualTryOnController::class, 'checkStatus']);
    Route::get('/virtual-try-on/history', [VirtualTryOnController::class, 'history']);
});

