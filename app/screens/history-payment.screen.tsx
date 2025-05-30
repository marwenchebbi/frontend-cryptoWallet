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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import Header from '@/app/components/Header';
import { useTransactionHistory } from '../hooks/transactions-hooks/history.hooks';
import { TransactionType } from '../models/transaction';

// Define props interface for PaymentHistoryScreen
interface PaymentHistoryScreenProps {
  transactionType?: TransactionType;
}

const PaymentHistoryScreen: React.FC<PaymentHistoryScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const [backEnabled, setBackEnabled] = useState<boolean>(true);

  // Force transactionType to PAYMENT
  const transactionType = TransactionType.PAYMENT;

  // State for pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [sort] = useState('-createdAt');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch userId from SecureStore
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await SecureStore.getItemAsync('userId');
      setUserId(storedUserId);
    };
    fetchUserId();
  }, []);

  // Fetch transaction history
  const { data, isLoading, error, refetch } = useTransactionHistory(
    page,
    limit,
    sort,
    transactionType
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View
        entering={FadeIn.duration(600)}
        className="absolute top-0 left-0 right-0 z-40 bg-transparent"
        style={{ paddingTop: insets.top }}
      >
        <Header
          title="Payment History"
          onBackPress={handleBack}
          isLandscape={isLandscape}
          backEnabled={backEnabled}
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
              No payment transactions found.
            </Animated.Text>
          )}

          {/* Transaction Cards */}
          {data &&
            data.transactions.map((transaction: any, index: number) => {
              const operation = transaction.operation || 'sell';
              const isBuy = operation === 'buy';
              const currency = isBuy ? 'PRX' : 'USDT'; // Buy shows USDT, Sell shows PRX
              const isDebit = transaction.paymentType === 'debit';
              const amountPrefix = isDebit ? '+' : '-'; // Debit shows +, Credit shows -
              const amountColor = isDebit ? 'text-green-500' : 'text-red-500';
              const operationText = isDebit ? 'Debit' : 'Credit';
              const operationColor = isDebit ? 'text-green-500' : 'text-red-500';

              return (
                <View key={transaction.id || index}>
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
                          Payment <Text className={operationColor}>({operationText})</Text>
                        </Text>
                        <Text className="text-gray-500 text-sm mt-1">
                          {formatDate(transaction.date)}
                        </Text>
                      </View>
                      <Text className={`text-sm font-bold text-right ${amountColor}`}>
                        {amountPrefix} {transaction.amount.toFixed(2)} {currency}
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

export default PaymentHistoryScreen;