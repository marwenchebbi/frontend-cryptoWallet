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
import { Ionicons } from '@expo/vector-icons';
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

const Home: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isLandscape = useOrientation();
  const router = useRouter();
    const { refetch } = usePriceHistory();
  

  // State for user ID and wallet address
  const [userId, setUserId] = useState<string | null>(null);
  const [senderAddress, setSenderAddress] = useState<string | null>(null);

  // State to hold chart refetch function
  const [chartRefetch, setChartRefetch] = useState<(() => void) | null>(null);

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

  // Handler to receive chart refetch function from TokenPriceChart
  const handleChartRefetch = useCallback((refetchFunc: () => void) => {
    setChartRefetch(() => refetchFunc);
  }, []);

  // Refetch wallet, price, and chart information
  const updateWalletData = useCallback(() => {
    walletRefetch();
    priceRefetch();
    refetch();
  }, [walletRefetch, priceRefetch, chartRefetch]);

  // Navigation handlers for action buttons
  const handleSend = () => router.push('/(tabs)/Transfer');
  const handleSell = () => router.push('/(tabs)/Exchange');
  const handleBuy = () => router.push('/(tabs)/Exchange');
  const handleLoadMore = () => {
    router.push({
      pathname: '/screens/history.screen',
      params: { transactionType: TransactionType.TRADING },
    });
  };

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
          onHistoryPress={handleLoadMore}
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
          <TouchableOpacity onPress={handleSend} className="items-center">
            <View className="bg-purple-100 p-4 rounded-full">
              <FontAwesome name="send" size={24} color="#A855F7" />
            </View>
            <Text className="text-black mt-2">Send</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSell} className="items-center">
            <View className="bg-purple-100 p-4 rounded-full">
              <FontAwesome5 name="donate" size={24} color="#A855F7" />
            </View>
            <Text className="text-black mt-2">Sell</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleBuy} className="items-center">
            <View className="bg-purple-100 p-4 rounded-full">
              <Ionicons name="cash" size={24} color="#A855F7" />
            </View>
            <Text className="text-black mt-2">Buy</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Transaction History Section */}
        <Animated.View
          entering={FadeInDown.duration(600).delay(500)}
          className="px-4 mt-6"
        >
          <TransactionHistory userId={userId} onLoadMore={handleLoadMore} />
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