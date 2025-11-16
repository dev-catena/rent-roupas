import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../../config/api';

export default function QRCodeScanScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  async function handleBarCodeScanned({ data }) {
    if (scanned || processing) return;
    
    setScanned(true);
    setProcessing(true);

    try {
      const response = await api.post('/qrcode/scan', {
        qr_code: data
      });

      if (response.data.success) {
        const checkpoint = response.data.data;
        
        Alert.alert(
          '✅ QR Code Escaneado!',
          `Checkpoint registrado com sucesso!\n\nTipo: ${getTypeLabel(checkpoint.type)}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao escanear QR Code:', error);
      
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível processar o QR Code',
        [
          {
            text: 'Tentar Novamente',
            onPress: () => {
              setScanned(false);
              setProcessing(false);
            }
          },
          {
            text: 'Voltar',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }
  }

  function getTypeLabel(type) {
    switch (type) {
      case 'delivery_to_professional':
        return 'Recebimento da Peça';
      case 'return_from_professional':
        return 'Recebimento da Peça Ajustada';
      case 'return_to_owner':
        return 'Devolução ao Proprietário';
      default:
        return type;
    }
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Solicitando permissão da câmera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Sem acesso à câmera</Text>
        <Text style={styles.submessage}>
          Permita o acesso à câmera para escanear QR Codes
        </Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Permitir Acesso</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      
      <View style={styles.overlay}>
        <View style={styles.topOverlay} />
        <View style={styles.middleRow}>
          <View style={styles.sideOverlay} />
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          <View style={styles.sideOverlay} />
        </View>
        <View style={styles.bottomOverlay}>
          <Text style={styles.instructions}>
            {processing
              ? 'Processando...'
              : 'Posicione o QR Code dentro da área marcada'}
          </Text>
          
          {scanned && !processing && (
            <TouchableOpacity
              style={styles.scanAgainButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.scanAgainButtonText}>Escanear Novamente</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  submessage: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  middleRow: {
    flexDirection: 'row',
    height: 280,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scanArea: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#6366f1',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  instructions: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  scanAgainButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  scanAgainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButton: {
    marginTop: 12,
    backgroundColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
