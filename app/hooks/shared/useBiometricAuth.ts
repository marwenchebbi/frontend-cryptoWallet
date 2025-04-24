// hooks/auth-hooks/useBiometricAuth.ts
import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert, Linking, Platform } from 'react-native';

export const useBiometricAuth = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnrolled, setIsBiometricEnrolled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(compatible);
        setIsBiometricEnrolled(enrolled);
        if (compatible && !enrolled) {
          // Show alert if biometrics are supported but not enrolled
          Alert.alert(
            'Biometric Setup Required',
            'Please set up biometric authentication (Face ID or Fingerprint) in your device settings to use this feature to keep your wallet secure 😊.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Open Settings',
                onPress: openDeviceSettings,
              },
            ]
          );
        }
      } catch (err) {
        setError('Failed to check biometric support');
      }
    })();
  }, []);

  // Function to open device settings
  const openDeviceSettings = async () => {
    try {
      if (Platform.OS === 'ios') {
        // iOS: Open settings
        await Linking.openURL('App-Prefs:');
      } else if (Platform.OS === 'android') {
        // Android: Open security settings
        await Linking.openSettings();
      }
    } catch (err) {
      setError('Failed to open device settings');
    }
  };

  const authenticate = async (): Promise<boolean> => {
    if (!isBiometricSupported) {
      setError('Biometric authentication not supported');
      return false;
    }
    if (!isBiometricEnrolled) {
      setError('Biometric authentication not set up');
      Alert.alert(
        'Biometric Setup Required',
        'Please set up biometric authentication in your device settings.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Open Settings',
            onPress: openDeviceSettings,
          },
        ]
      );
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify your identity',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
      });
      if (!result.success) {
        setError('Biometric verification failed');
        return false;
      }
      return true;
    } catch (err) {
      setError('Failed to perform biometric verification');
      return false;
    }
  };

  return { isBiometricSupported, isBiometricEnrolled, authenticate, error };
};