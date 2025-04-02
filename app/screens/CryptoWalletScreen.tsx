import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { RFValue } from 'react-native-responsive-fontsize';
import { useOrientation } from '../hooks/shared/useOrientation'; // Adjust path as needed

const CryptoWalletScreen = () => {
  const router = useRouter();
  const isLandscape = useOrientation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header at the Top */}
      <View
        className={`w-full ${isLandscape ? 'pt-2 pb-1 px-6' : 'pt-4 pb-2 px-4 mt-6'}`}
      >
        <Text
          className={`font-bold text-black text-center ${
            isLandscape ? 'text-2xl' : 'text-3xl'
          }`}
        >
          Crypto Wallet
        </Text>
      </View>

      {/* Intro in the Middle */}
      <View className={`flex-1 justify-center items-center ${isLandscape ? 'px-6' : 'px-4'}`}>
        <Text
          className={`text-gray-600 text-center leading-6 ${
            isLandscape ? 'text-base' : 'text-lg'
          }`}
          style={{ fontSize: RFValue(isLandscape ? 14 : 18) }}
        >
          Secure, fast, and easy-to-use crypto wallet. Manage your assets effortlessly and stay ahead in the digital economy.
        </Text>
      </View>

      {/* Buttons and User Agreement at the Bottom */}
      <View className={`w-full ${isLandscape ? 'px-6 pb-4' : 'px-4 pb-8'}`}>
        {/* User Agreement and Privacy Policy Text */}
        <View className={`flex-row items-center justify-center ${isLandscape ? 'mb-2' : 'mb-4'}`}>
          <Text
            className={`text-gray-700 m-2 ${isLandscape ? 'text-xs' : 'text-sm'}`}
            style={{ fontSize: RFValue(isLandscape ? 12 : 14) }}
          >
            By continuing you agree to our{' '}
            <Text className="underline text-purple-600">User Agreement</Text>{' '}
            and{' '}
            <Text className="underline text-purple-600">Privacy Policy</Text>.
          </Text>
          <Ionicons
            name="checkbox"
            size={RFValue(16)}
            color="#6B5B95"
            className="ml-2"
          />
        </View>

        {/* Buttons */}
        <View className={`flex-row justify-center ${isLandscape ? 'mb-4' : 'mb-6'}`}>
          <TouchableOpacity
            className={`bg-purple-200 rounded-full mr-4 ${
              isLandscape ? 'py-2 px-4' : 'py-3 px-6'
            }`}
            onPress={() => router.push('/(tabs)/Home')}
          >
            <Text
              className={`text-black font-medium ${
                isLandscape ? 'text-sm' : 'text-base'
              }`}
              style={{ fontSize: RFValue(isLandscape ? 14 : 16) }}
            >
              Learn More
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`bg-black rounded-full ${
              isLandscape ? 'py-2 px-4' : 'py-3 px-6'
            }`}
            onPress={() => router.push('/screens/LoginScreen')}
          >
            <Text
              className={`text-white font-medium ${
                isLandscape ? 'text-sm' : 'text-base'
              }`}
              style={{ fontSize: RFValue(isLandscape ? 14 : 16) }}
            >
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

export default CryptoWalletScreen;