import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import { RFValue } from 'react-native-responsive-fontsize';
import { useOrientation } from '../hooks/shared/useOrientation';
import { isAuthenticated } from '../hooks/shared/useIsAuthenticated';

const CryptoWalletScreen = () => {
  const router = useRouter();
  const isLandscape = useOrientation();


  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      setAuth(authenticated);
    };
    checkAuth();
  }, []);

  if (auth === null) return null;

  // 🔁 If already authenticated, redirect to main app tabs
  if (auth) {
    return <Redirect href="/(tabs)/Home" />;
  }

  return (
    <LinearGradient
      colors={['rgba(255, 255, 255 ,1)', 'rgba(255, 255, 255,0.5)']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={{
            width: '100%',
            paddingTop: isLandscape ? 8 : 16,
            paddingBottom: isLandscape ? 4 : 8,
            paddingHorizontal: isLandscape ? 24 : 16,
            marginTop: isLandscape ? 0 : 24,
          }}
        >
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: isLandscape ? 24 : 32,
              fontFamily: 'Inter-Black',
            }}
          >
            Crypto Wallet
          </Text>
        </Animated.View>

        {/* Lottie Animation */}
        <Animated.View  className='opacity-50'
          entering={FadeIn.duration(600)}
          style={{
            width: '100%',
            height: isLandscape ? 200 : 250, // Adjust height as needed
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: isLandscape ? 8 : 16,
            
            
          }}
        >
          <LottieView
            source={require('../images/splash.json')}
            autoPlay
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </Animated.View>

        {/* Intro */}
        <Animated.View className='pt-0'
          entering={FadeInDown.duration(600).delay(200)}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center', // Center the text
            paddingHorizontal: isLandscape ? 24 : 16,
          }}
        >
          <Text
            style={{
              color: 'black',
              textAlign: 'center',
              lineHeight: 30,
              fontSize: RFValue(isLandscape ? 14 : 18),
              fontFamily: 'Inter-Regular',
            }}
          >
Manage your custom asset effortlessly and stay ahead in the digital economy.
          </Text>
        </Animated.View>

        {/* Buttons */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          style={{
            width: '100%',
            paddingHorizontal: isLandscape ? 24 : 16,
            paddingBottom: isLandscape ? 16 : 32,
          }}
        >
          <View className='mx-5'
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: isLandscape ? 8 : 16,
            }}
          >
            <Text
              style={{
                color: '#D1D5DB',
                marginRight: 4,
                fontSize: RFValue(isLandscape ? 10 : 12),
              }}
            >
              By continuing you agree to our{' '}
              <Text style={{ textDecorationLine: 'underline', color: '#A78BFA' }}>
                User Agreement
              </Text>{' '}
              and{' '}
              <Text style={{ textDecorationLine: 'underline', color: '#A78BFA' }}>
                Privacy Policy
              </Text>.
            </Text>
            <Ionicons name="checkbox" size={RFValue(16)} color="#6B5B95" />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: isLandscape ? 16 : 24,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: '#E9D5FF',
                borderRadius: 999,
                paddingVertical: isLandscape ? 8 : 12,
                paddingHorizontal: isLandscape ? 16 : 24,
                marginRight: 16,
              }}
              onPress={() => router.push('/screens/email-verification.screen')}
            >
              <Text
                style={{
                  color: 'black',
                  fontWeight: '500',
                  fontSize: RFValue(isLandscape ? 14 : 16),
                }}
              >
                Learn More
              </Text>
            </TouchableOpacity>

            <Animated.View entering={FadeIn.duration(600).delay(600)}>
              <TouchableOpacity
                style={{
                  borderRadius: 999,
                  paddingVertical: isLandscape ? 8 : 12,
                  paddingHorizontal: isLandscape ? 16 : 24,
                  backgroundColor: 'black',
                }}
                onPress={() => router.push('/screens/login.screen')}
              >
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '500',
                    fontSize: RFValue(isLandscape ? 14 : 16),
                  }}
                >
                  Get Started
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>

        <StatusBar style="light" translucent={false} backgroundColor="transparent" />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default CryptoWalletScreen;