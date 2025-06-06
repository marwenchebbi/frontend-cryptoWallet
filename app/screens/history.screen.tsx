import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import Header from '@/app/components/Header';

import { useTransactionHistory } from '../hooks/transactions-hooks/history.hooks';
import { TransactionType } from '../models/transaction';


interface HistoryScreenProps {
  transactionType?: TransactionType;
}


const HistoryScreen: React.FC<HistoryScreenProps> = ({ transactionType: propTransactionType }) => {
  const insets = useSafeAreaInsets();
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const params = useLocalSearchParams();

  const [backenabled,setBackEnabled] = useState<boolean>(true)

  // Extract transactionType from params if not provided via props
  const transactionType = propTransactionType || (params.transactionType as TransactionType);

  // State for pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort] = useState('-createdAt');
  const [refreshing, setRefreshing] = useState(false);

  // State for filter
  const [filter, setFilter] = useState<string | null>(null); // e.g., 'buy', 'sell', 'send', 'receive'

  // Fetch userId from SecureStore
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  // Fetch transaction history with filter
  const { data, isLoading, error, refetch } = useTransactionHistory(

    page,
    limit,
    sort,
    transactionType,
    filter
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Africa/Tunis',
    });
  };

  // Handle filter selection
  const handleFilter = (newFilter: string | null) => {
    setFilter(newFilter);
    setPage(1); // Reset to first page when filter changes
    refetch(); // Refetch with new filter
  };

  // Loading state for userId
  if (!userId) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Animated.View entering={FadeIn.duration(600)}>
          <ActivityIndicator size="large" color="#A855F7" />
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Error state for missing transactionType
  if (!transactionType) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Animated.View entering={FadeIn.duration(600)}>
          <Text className="text-red-500 text-center">Error: Transaction type is required.</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View
        entering={FadeIn.duration(600)}
        className="absolute top-0 left-0 right-0 z-40 bg-transparent"
        style={{ paddingTop: insets.top }}
      >
        <Header
          title={`${transactionType === TransactionType.TRADING ? 'Trading' : 'Transfer'} History`}
          onBackPress={handleBack}
          isLandscape={isLandscape}
          backEnabled={backenabled}
          historyEnabled={false}
        />
      </Animated.View>

      <ScrollView

        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 60 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#A855F7']}
            tintColor="#A855F7"
          />
        }
      >
        <Animated.View 
          entering={FadeInDown.duration(600).delay(200)}
          className={`flex-1 ${isLandscape ? 'px-6' : 'px-4'} pb-4`}
        >
          {/* Filter Buttons */}
          <Animated.View entering={FadeInDown.duration(600).delay(300)} className="flex-row justify-around mb-4">
            <TouchableOpacity
              onPress={() => handleFilter(null)}
              className={`py-2 px-4 rounded-full ${filter === null ? 'bg-purple-300' : 'bg-gray-200'}`}
            >
              <Text className={`${filter === null ? 'text-white' : 'text-black'} font-semibold`}>
                All
              </Text>
            </TouchableOpacity>
            {transactionType === TransactionType.TRADING ? (
              <>
                <TouchableOpacity
                  onPress={() => handleFilter('buy')}
                  className={`py-2 px-4 rounded-full ${filter === 'buy' ? 'bg-purple-300' : 'bg-gray-200'}`}
                >
                  <Text className={`${filter === 'buy' ? 'text-white' : 'text-black'} font-semibold`}>
                    Buy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleFilter('sell')}
                  className={`py-2 px-4 rounded-full ${filter === 'sell' ? 'bg-purple-300' : 'bg-gray-200'}`}
                >
                  <Text className={`${filter === 'sell' ? 'text-white' : 'text-black'} font-semibold`}>
                    Sell
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => handleFilter('send')}
                  className={`py-2 px-4 rounded-full ${filter === 'send' ? 'bg-purple-300' : 'bg-gray-200'}`}
                >
                  <Text className={`${filter === 'send' ? 'text-white' : 'text-black'} font-semibold`}>
                    Send
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleFilter('receive')}
                  className={`py-2 px-4 rounded-full ${
                    filter === 'receive' ? 'bg-purple-300' : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`${filter === 'receive' ? 'text-white' : 'text-black'} font-semibold`}
                  >
                    Receive
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

          {/* Loading State */}
          {isLoading && (
            <Animated.View
              entering={FadeIn.duration(600).delay(400)}
              className="flex-1 justify-center items-center"
            >
              <ActivityIndicator size="large" color="#A855F7" />
            </Animated.View>
          )}

          {/* Error State */}
          {error && (
            <Animated.Text
              entering={FadeIn.duration(600).delay(400)}
              className="text-red-500 text-center mt-4"
            >
              {error.message}
            </Animated.Text>
          )}

          {/* No Transactions State */}
          {data && data.transactions.length === 0 && (
            <Animated.Text
              entering={FadeIn.duration(600).delay(400)}
              className="text-gray-600 text-center mt-4"
            >
              No transactions found.
            </Animated.Text>
          )}

          {/* Transaction Cards */}
          {data &&
            data.transactions.map((transaction: any, index: number) => {
              const isSender = transaction.sender_id && transaction.sender_id.toString() === userId;
              const operation = transaction.operation || 'sell';
              const isBuy = operation === 'buy';
              const currency = isBuy ? 'PRX' : 'USDT';
              const operationText =
                transactionType === TransactionType.TRADING
                  ? isBuy
                    ? 'Buy'
                    : 'Sell'
                  : isSender
                  ? 'Send'
                  : 'Received';
              const operationColor =
                operationText === 'Buy'
                  ? 'text-green-500'
                  : operationText === 'Sell'
                  ? 'text-red-500'
                  : operationText === 'Send'
                  ? 'text-orange-500'
                  : 'text-blue-500';

              return (
                
                <View
                  key={transaction.id || index} // Use transaction.id if available
                 
                >
                  <LinearGradient
                    colors={['#A855F7', '#F472B6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-lg p-[2px] mb-4 mt-4"
                    style={styles.cardGradient}
                  >
                    <View className="bg-white rounded-lg p-4 flex-row justify-between items-center">
                      <View>
                        <Text className="text-black font-semibold text-base">
                          {transactionType === TransactionType.TRADING ? 'PRX' : 'Transfer'}{' '}
                          <Text className={operationColor}>({operationText})</Text>
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">
                          {formatDate(transaction.date)}
                        </Text>
                      </View>
                      <Text
                        className={`text-sm font-bold text-right ${
                          transactionType === TransactionType.TRADING
                            ? isBuy
                              ? 'text-gray-500'
                              : 'text-gray-500'
                            : isSender
                            ? 'text-red-500'
                            : 'text-green-500'
                        }`}
                      >
                        {transactionType === TransactionType.TRADING
                          ? isBuy
                            ? `+ ${transaction.received_amount?.toFixed(2) || '0.00'} PRX \n - $${transaction.amount.toFixed(2)} USDT`
                            : `+ $${transaction.received_amount?.toFixed(2) || '0.00'} USDT \n - ${transaction.amount.toFixed(2)} PRX`
                          : `${isSender ? '-' : '+'} ${transaction.amount.toFixed(2)} ${currency}`}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              
              );
            })}
        </Animated.View>
      </ScrollView>

      <StatusBar style="dark" translucent={false} backgroundColor="white" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardGradient: {
    overflow: 'hidden',
  },
});

export default HistoryScreen;