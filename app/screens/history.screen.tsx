import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import Header from '@/components/Header';
import { TransactionType } from '../models/types';
import { useTransactionHistory } from '../hooks/transactions-hooks/history.hooks';

// Define props interface for HistoryScreen
interface HistoryScreenProps {
  transactionType?: TransactionType; // Make optional since we may get it from params
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ transactionType: propTransactionType }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const params = useLocalSearchParams(); // Get route params

  // Extract transactionType from params if not provided via props
  const transactionType = propTransactionType || (params.transactionType as TransactionType);

  // State for pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(50); // Number of items per page
  const [sort] = useState('-createdAt'); // Default sorting by newest first
  const [refreshing, setRefreshing] = useState(false); // State for refresh control

  // Fetch userId from SecureStore
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setUserId(storedUserId);
    };
    fetchUserId();
    console.log('transactionType:', transactionType); // Debug log
    console.log('Route params:', params); // Debug log for params
  }, [transactionType, params]);

  // Fetch transaction history for the specified transactionType
  const { data, isLoading, error, refetch } = useTransactionHistory(
    userId || '',
    page,
    limit,
    sort,
    transactionType
  );

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch(); // Refetch transactions
    setRefreshing(false);
  };

  // Format date to "MMM DD, YYYY, hh:mm AM/PM" (e.g., "Apr 22, 2025, 2:30 PM")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Tunis',
    });
  };

  if (!userId) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#A855F7" />
      </SafeAreaView>
    );
  }

  if (!transactionType) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500 text-center">Error: Transaction type is required.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View
        className="absolute top-0 left-0 right-0 z-40 bg-white"
        style={{ paddingTop: insets.top }}
      >
        <Header
          title={`${transactionType === TransactionType.TRADING ? 'Trading' : 'Transfer'} History`}
          onBackPress={handleBack}
          isLandscape={isLandscape}
          backEnabled={true}
          historyEnabled={false}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 60 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#A855F7']} // Spinner color
            tintColor="#A855F7" // iOS spinner color
          />
        }
      >
        <View className={`flex-1 ${isLandscape ? 'px-6' : 'px-4'} pb-4`}>
          {isLoading && (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#A855F7" />
            </View>
          )}

          {error && (
            <Text className="text-red-500 text-center mt-4">{error.message}</Text>
          )}

          {data && data.transactions.length === 0 && (
            <Text className="text-gray-600 text-center mt-4">No transactions found.</Text>
          )}

          {data &&
            data.transactions.map((transaction: any, index: any) => {
              const isSender = transaction.sender_id && transaction.sender_id.toString() === userId;
              const operation = transaction.operation || 'sell'; // Fallback to 'sell' if undefined
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
                <LinearGradient
                  key={index}
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
                      className={`text-md font-bold ${
                        transactionType === TransactionType.TRADING
                          ? isBuy
                            ? 'text-green-500'
                            : 'text-red-500'
                          : isSender
                          ? 'text-red-500'
                          : 'text-green-500'
                      }`}
                    >
                      {transactionType === TransactionType.TRADING
                        ? isBuy
                          ? `+ ${transaction.received_amount?.toFixed(2) || '0.00'} PRX / - $${transaction.amount.toFixed(2)} USDT`
                          : `+ $${transaction.received_amount?.toFixed(2) || '0.00'} USDT / - ${transaction.amount.toFixed(2)} PRX`
                        : `${isSender ? '-' : '+'} ${transaction.amount.toFixed(2)} ${currency}`}
                    </Text>
                  </View>
                </LinearGradient>
              );
            })}
        </View>
      </ScrollView>

      <StatusBar style="dark" translucent={false} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardGradient: {
    overflow: 'hidden',
  },
});

export default HistoryScreen;