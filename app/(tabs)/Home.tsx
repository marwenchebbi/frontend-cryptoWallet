import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { FontAwesome6, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import Header from '@/app/components/Header';
import { useGetWalletInfo } from '../hooks/wallet-info-hooks/balances.hooks';
import { useGetPrice } from '../hooks/transactions-hooks/price.hooks';
import BalanceDetails from '../components/BalancesDetails';
import TransactionHistory from '../components/TransactionHistory';
import { TransactionType } from '../models/transaction';
import TokenPriceChart from '../components/TokenPriceChart';
import { usePriceHistory } from '../hooks/price-history-hooks/price-history.hooks';
import { useTransactionHistory } from '../hooks/transactions-hooks/history.hooks';

const Home: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isLandscape = useOrientation();
  const router = useRouter();
  const { refetch } = usePriceHistory();
  const { refetch: historyRef } = useTransactionHistory(1, 3, '-createdAt');


  // State for user ID and wallet address
  const [userId, setUserId] = useState<string | null>(null);
  const [senderAddress, setSenderAddress] = useState<string | null>(null);



  // Fetch user ID and wallet address
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      const storedSenderAddress = await SecureStore.getItemAsync('walletAddress');
      setUserId(storedUserId);
      setSenderAddress(storedSenderAddress);
    };
    fetchUserData();
  }, []);

  // State for balance toggle
  const [selectedBalance, setSelectedBalance] = useState<'Proxym' | 'USDT'>('Proxym');

  // Fetch wallet and price data
  const {
    data: walletInfo,
    isLoading: isWalletLoading,
    error: walletError,
    refetch: walletRefetch,
  } = useGetWalletInfo(senderAddress || '');

  const {
    data: priceInfo,
    isLoading: isPriceLoading,
    error: priceError,
    refetch: priceRefetch,
  } = useGetPrice();



  // Refetch wallet, price, and chart information
  const updateWalletData = useCallback(() => {
    walletRefetch();
    priceRefetch();
    refetch();
    historyRef()
  }, [walletRefetch, priceRefetch, historyRef]);

  // Navigation handlers for action buttons
  const handleTransfer = () => router.push('/(tabs)/Transfer');
  const handleExchange = () => router.push('/(tabs)/Exchange');
  const handlePayment = () =>     router.push('/screens/payment.screen')


  // Loading state
  if (!userId || !senderAddress || isWalletLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Animated.View entering={FadeIn.duration(600)}>
          <ActivityIndicator size="large" color="#A855F7" />
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Error state
  if (walletError) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Animated.View entering={FadeIn.duration(600)}>
          <Text className="text-red-500">Error: {walletError.message}</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <Animated.View
        entering={FadeIn.duration(600)}
        className="absolute top-0 left-0 right-0 z-40 bg-transparent"
        style={{ paddingTop: insets.top }}
      >
        <Header
          title="Home"

          isLandscape={isLandscape}
          backEnabled={false}
          historyEnabled={false}
        />
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 60 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isWalletLoading || isPriceLoading}
            onRefresh={updateWalletData}
          />
        }
      >
        {/* Balance Section */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <BalanceDetails
            walletInfo={walletInfo}
            selectedBalance={selectedBalance}
            onToggleBalance={() =>
              setSelectedBalance(selectedBalance === 'Proxym' ? 'USDT' : 'Proxym')
            }
            isLandscape={isLandscape}
            price={priceInfo ?? 0}
          />
        </Animated.View>

        {/* Refresh Hint */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(300)}
          className="mt-4 p-2 bg-white rounded"
        >
          {!isWalletLoading && (
            <Text className="text-pink-700 text-sm text-center">
              Swipe down to refresh your balance details
            </Text>
          )}
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(400)}
          className="flex-row justify-around mt-6 mx-12"
        >
          <TouchableOpacity onPress={handleTransfer} className="items-center">
            <View className="bg-purple-100 p-4 rounded-full">
              <FontAwesome6 name="money-bill-transfer" size={24} color="#A855F7" />
            </View>
            <Text className="text-gray-500 text-sm mt-2">Transfer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleExchange} className="items-center">
            <View className="bg-purple-100 p-4 rounded-full">
              <MaterialIcons name="currency-exchange" size={24} color="#A855F7" />
            </View>
            <Text className="text-gray-500 text-sm mt-2">Exchange</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePayment} className="items-center">
            <View className="bg-purple-100 p-4 rounded-full">
              <FontAwesome6 name="circle-dollar-to-slot" size={24} color="#A855F7" />
            </View>
            <Text className="text-gray-500 text-sm mt-2">Suppply</Text>
          </TouchableOpacity>

        </Animated.View>

        {/* Transaction History Section */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(500)}
          className="px-4 mt-6"
        >
          <TransactionHistory onLoadMore={()=>{ console.log()}} />
        </Animated.View>

        {/* Price Chart Section */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(600)}
          className="px-4 mt-6 mb-6"
        >
          <TokenPriceChart />
        </Animated.View>
      </ScrollView>

      <StatusBar style="dark" translucent={false} backgroundColor="white" />
    </SafeAreaView>
  );
};

export default Home;