// components/QRCodeScanner.tsx
import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface QRCodeScannerProps {
  onScan: (data: string) => void; // Callback to handle scanned data
  onClose: () => void; // Callback to close the scanner
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onClose }) => {
  const [permission, requestPermission] = useCameraPermissions();

  // Request camera permission if not already granted
  const handlePermission = async () => {
    if (!permission) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        onClose();
        return false;
      }
    } else if (!permission.granted) {
      onClose();
      return false;
    }
    return true;
  };

  // Check permission on mount
  React.useEffect(() => {
    handlePermission();
  }, []);

  // Handle QR code scan
  const handleBarCodeScanned = ({ data }: { data: string }) => {
    onScan(data);
    onClose();
  };

  if (!permission || !permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">Camera permission required</Text>
        <TouchableOpacity onPress={onClose} className="mt-4">
          <Text className="text-white text-base">Close</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Get screen dimensions for responsive sizing
  const { width, height } = Dimensions.get('window');
  const scanAreaSize = Math.min(width, height) * 0.6; // 60% of the smallest dimension

  return (
    <SafeAreaView className="flex-1 bg-black">
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={handleBarCodeScanned}
      >
        {/* Overlay with transparent scan area */}
        <View style={StyleSheet.absoluteFill}>
          {/* Semi-transparent overlay */}
          <View style={styles.overlay} />
          {/* Cutout for scan area */}
          <View
            style={{
              ...styles.scanArea,
              width: scanAreaSize,
              height: scanAreaSize,
              top: (height - scanAreaSize) / 2,
              left: (width - scanAreaSize) / 2,
            }}
          >
            {/* Optional corner markers or border */}
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
        </View>

        <View className="flex-1 justify-between">
          <View className="p-4">
            <Text className="text-white text-lg font-semibold">Scan QR Code</Text>
            <Text className="text-white text-sm mt-1">Align the QR code within the frame</Text>
          </View>
          <TouchableOpacity
            className="p-4 bg-transparent rounded-full m-4 self-center w-1/2"
            onPress={onClose}
          >
            <Text className="text-white font-semibold mb-20 text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

// Style definitions
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black overlay
  },
  scanArea: {
    borderWidth: 2,
    borderColor: '#00FF00', // Green border for visibility
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00FF00',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00FF00',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00FF00',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00FF00',
  },
});

export default QRCodeScanner;