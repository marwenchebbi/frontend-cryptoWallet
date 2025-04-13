import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Dimensions, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

const CryptoWalletScreen = () => {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // Consistent spacing scale
  const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  };

  // Responsive font size helper
  const responsiveFontSize = (baseSize: number) => {
    return Math.round(baseSize * Math.min(width, height) / 375);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {/* Header at the Top */}
      <View
        style={{
          width: '100%',
          paddingTop: isLandscape ? SPACING.sm : SPACING.lg,
          paddingBottom: isLandscape ? SPACING.xs : SPACING.sm,
          paddingHorizontal: isLandscape ? SPACING.lg : SPACING.md,
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(isLandscape ? 24 : 28),
            fontWeight: 'bold',
            color: '#000000',
            textAlign: 'center',
          }}
          accessible
          accessibilityLabel="Crypto Wallet Header"
        >
          Crypto Wallet
        </Text>
      </View>

      {/* Intro in the Middle */}
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: isLandscape ? SPACING.lg : SPACING.md,
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(isLandscape ? 18 : 20),
            fontWeight: '600',
            color: '#1F2937',
            textAlign: 'center',
            marginBottom: SPACING.sm,
          }}
          accessible
          accessibilityLabel="Crypto Wallet Introduction"
        >
          Your Crypto, Your Control
        </Text>
        <Text
          style={{
            fontSize: responsiveFontSize(isLandscape ? 14 : 16),
            color: '#4B5563',
            textAlign: 'center',
            lineHeight: responsiveFontSize(22),
          }}
        >
          Manage your assets securely and effortlessly with our fast and easy-to-use wallet.
        </Text>
      </View>

      {/* Buttons and User Agreement at the Bottom */}
      <View
        style={{
          width: '100%',
          paddingHorizontal: isLandscape ? SPACING.lg : SPACING.md,
          paddingBottom: isLandscape ? SPACING.md : SPACING.lg,
        }}
      >
        {/* User Agreement Text */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: isLandscape ? SPACING.sm : SPACING.md,
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(isLandscape ? 14 : 15),
              color: '#4B5563',
              textAlign: 'center',
              marginHorizontal: SPACING.sm,
            }}
            accessible
            accessibilityLabel="User Agreement and Privacy Policy"
          >
            By continuing you agree to our{' '}
            <Text
              style={{ color: '#6B5B95', textDecorationLine: 'underline' }}
              onPress={() => router.push('/')}
            >
              User Agreement
            </Text>{' '}
            and{' '}
            <Text
              style={{ color: '#6B5B95', textDecorationLine: 'underline' }}
              onPress={() => router.push('/')}
            >
              Privacy Policy
            </Text>.
          </Text>
        </View>

        {/* Buttons */}
        <View
          style={{
            flexDirection: isLandscape ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: SPACING.sm,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: '#6B5B95',
              borderRadius: 9999,
              paddingVertical: isLandscape ? SPACING.sm : SPACING.md,
              paddingHorizontal: isLandscape ? SPACING.md : SPACING.lg,
              marginRight: isLandscape ? SPACING.md : 0,
              marginBottom: isLandscape ? 0 : SPACING.sm,
              minHeight: 48,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={0.7}
            onPress={() => router.push('/')}
            accessible
            accessibilityLabel="Explore Features"
            accessibilityHint="Learn more about the crypto wallet features"
          >
            <Text
              style={{
                fontSize: responsiveFontSize(isLandscape ? 14 : 16),
                color: '#FFFFFF',
                fontWeight: '500',
                textAlign: 'center',
              }}
            >
              Explore Features
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#000000',
              borderRadius: 9999,
              paddingVertical: isLandscape ? SPACING.sm : SPACING.md,
              paddingHorizontal: isLandscape ? SPACING.md : SPACING.lg,
              minHeight: 48,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            activeOpacity={0.7}
            onPress={() => router.push('/screens/SignupScreen')}
            accessible
            accessibilityLabel="Sign Up"
            accessibilityHint="Create a new account to start using the crypto wallet"
          >
            <Text
              style={{
                fontSize: responsiveFontSize(isLandscape ? 14 : 16),
                color: '#FFFFFF',
                fontWeight: '500',
                textAlign: 'center',
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default CryptoWalletScreen;