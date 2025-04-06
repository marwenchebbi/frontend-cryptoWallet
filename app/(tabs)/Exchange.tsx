import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

// Custom hooks
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';

// UI Components
import Header from '@/components/Header';
import Button from '@/components/Button';
import BalanceDetails from '@/components/BalancesDetails';

// Utilities and validation
import * as SecureStore from 'expo-secure-store';
import { validateForm } from '../validators/helpers';
import { transferSchema } from '../validators/transaction.validator';

// Hooks for handling transactions and wallet info
import { useBuyPRX, useSellPRX } from '../hooks/transactions-hooks/exchange.hooks';
import { useGetWalletInfo } from '../hooks/wallet-info-hooks/balances.hooks';
import { useGetPrice } from '../hooks/transactions-hooks/price.hooks';

// Types and modals
import { TransferData } from '../models/types';
import ConfirmationModal from '../modals/confirmationModal';

const Exchange: React.FC = () => {
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();

  // Form state
  const [formData, setFormData] = useState<TransferData>({
    amount: '',
    senderAddress: '',
    receiverAddress: '',
    inputCurrency: 'USDT',
  });

  // UI state
  const [selectedBalance, setSelectedBalance] = useState<'Proxym' | 'USDT'>('Proxym');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [errors, setErrors] = useState<Partial<TransferData>>({});
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  // Select mutation based on trade type
  const { mutate, isPending, error } = tradeType === 'buy' ? useBuyPRX() : useSellPRX();

  // Fetch wallet and price data
  const { data: walletInfo, isLoading: isWalletLoading, error: walletError, refetch: walletRefetch } = useGetWalletInfo(
    formData.senderAddress
  );
  const { data: priceInfo, isLoading: isPriceLoading, error: priceError, refetch: priceRefetch } = useGetPrice();

  // Fetch wallet address from secure storage
  const fetchSenderAddress = async () => {
    const senderAddress = await SecureStore.getItemAsync('walletAddress');
    if (senderAddress) {
      setFormData((prev) => ({ ...prev, senderAddress }));
    } else {
      setErrors((prev) => ({ ...prev, senderAddress: 'Sender address not found' }));
    }
  };

// Display the equivalent amount message based on trade type and input currency
const displayEquivalentAmount = (equivalentAmount: string, inputCurrency: 'USDT' | 'PRX'): string => {
  // Buying PRX
  if (tradeType === 'buy') {
    return inputCurrency === 'USDT'
      ? `You will receive ≈ ${equivalentAmount} PRX` // Paying with USDT to get PRX
      : `You will spend ≈ ${equivalentAmount} USDT`; // Specifying PRX to buy with USDT
  } 
  // Selling PRX
  else {
    return inputCurrency === 'USDT'
      ? `You will spend ≈ ${equivalentAmount} PRX`   // Specifying USDT to get PRX (sell PRX)
      : `You will receive ≈ ${equivalentAmount} USDT`; // Selling PRX to get USDT
  }
};
  React.useEffect(() => {
    fetchSenderAddress();
  }, []);

  // Handle input field changes
  const handleInputChange = (field: keyof TransferData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Calculate equivalent amount using priceInfo
  const calculateEquivalent = (amount: string): string => {
    if (!amount || !priceInfo || priceInfo <= 0) return '0';
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return '0';

    // Assuming priceInfo is PRX/USDT rate (1 PRX = priceInfo USDT)
    if (formData.inputCurrency === 'PRX') {
      // PRX to USDT
      return (parsedAmount * priceInfo).toFixed(6);
    } else {
      // USDT to PRX
      return (parsedAmount / priceInfo).toFixed(6);
    }
  };

  // Submit the trade after confirming in the modal
  const submitTrade = () => {
    const equivalent = calculateEquivalent(formData.amount);
    const updatedFormData = {
      ...formData,
      receivedAmount: equivalent, // Add received amount to formData for backend
    };

    mutate(updatedFormData, {
      onSuccess: async (success: boolean) => {
        if (success) {
          setConfirmModalVisible(false);
          setFormData({ amount: '', senderAddress: formData.senderAddress, receiverAddress: '', inputCurrency: 'USDT' });
        }
      },
      onError: (err: any) => {
        setErrors((prev) => ({ ...prev, general: err.message }));
        setConfirmModalVisible(false);
      },
    });
  };

  // Refetch wallet and price information
  const updateWalletData = () => {
    priceRefetch();
    walletRefetch();
  };

  // Handle validation and show confirmation modal
  const handleTrade = async () => {
    const { errors, success } = await validateForm(formData, transferSchema);
    if (success) {
      if (!formData.senderAddress) {
        setErrors((prev) => ({ ...prev, senderAddress: 'Sender address is required' }));
        return;
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setErrors((prev) => ({ ...prev, amount: 'Please enter a valid amount' }));
        return;
      }
      setConfirmModalVisible(true);
    } else {
      setErrors(errors);
    }
  };

  if (isWalletLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text>Loading wallet information...</Text>
      </SafeAreaView>
    );
  }

  if (walletError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Text className="text-red-500">Error: {walletError.message}</Text>
      </SafeAreaView>
    );
  }

  const outputCurrency = tradeType === 'buy' ? 'PRX' : 'USDT';
  const equivalentAmount = calculateEquivalent(formData.amount);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isWalletLoading || isPriceLoading} onRefresh={updateWalletData} />
          }
        >
          <Header title="" onBackPress={handleBack} isLandscape={isLandscape} />
          <BalanceDetails
            walletInfo={walletInfo}
            selectedBalance={selectedBalance}
            onToggleBalance={() => setSelectedBalance(selectedBalance === 'Proxym' ? 'USDT' : 'Proxym')}
            isLandscape={isLandscape}
            price={priceInfo ?? 0}
          />
          <View className="mt-4 p-2 bg-white rounded">
            {!isWalletLoading && (
              <Text className="text-pink-700 text-sm text-center">
                Swipe down to refresh your balance details
              </Text>
            )}
          </View>

          <View className="flex-1 items-center justify-center my-8">
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-3xl p-[2px] w-10/12 max-w-md"
              style={styles.gradient}
            >
              <View className="bg-white rounded-3xl p-6" style={styles.exchangeContainer}>
                {/* Trade Type Toggle */}
                <View className="flex-row bg-gray-200 rounded-full p-1 mb-6">
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${tradeType === 'buy' ? 'bg-black' : ''}`}
                    onPress={() => setTradeType('buy')}
                  >
                    <Text className={`text-center font-semibold ${tradeType === 'buy' ? 'text-white' : 'text-black'}`}>
                      Buy PRX
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${tradeType === 'sell' ? 'bg-black' : ''}`}
                    onPress={() => setTradeType('sell')}
                  >
                    <Text className={`text-center font-semibold ${tradeType === 'sell' ? 'text-white' : 'text-black'}`}>
                      Sell PRX
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Input Currency Toggle */}
                <View className="p-2 bg-white rounded">
                  {!isWalletLoading && (
                    <Text className="text-gray-500 text-center">Choose the Currency to trade with</Text>
                  )}
                </View>
                <View className="flex-row bg-gray-200 rounded-full p-1 mb-6">
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${formData.inputCurrency === 'USDT' ? 'bg-black' : ''}`}
                    onPress={() => handleInputChange('inputCurrency', 'USDT')}
                  >
                    <Text className={`text-center font-semibold ${formData.inputCurrency === 'USDT' ? 'text-white' : 'text-black'}`}>
                      USDT
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${formData.inputCurrency === 'PRX' ? 'bg-black' : ''}`}
                    onPress={() => handleInputChange('inputCurrency', 'PRX')}
                  >
                    <Text className={`text-center font-semibold ${formData.inputCurrency === 'PRX' ? 'text-white' : 'text-black'}`}>
                      PRX
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Amount input field */}
                <View className="flex-row items-center mb-4">
                  <View className="bg-black rounded-full px-4 py-2">
                    <Text className="text-white text-base">{formData.inputCurrency}</Text>
                  </View>
                  <LinearGradient
                    colors={['#A855F7', '#F472B6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-full p-[2px] flex-1 ml-2"
                    style={styles.gradient}
                  >
                    <TextInput
                      className={`w-full bg-white text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'}`}
                      style={styles.input}
                      placeholder="Amount"
                      placeholderTextColor="#9CA3AF"
                      value={formData.amount}
                      onChangeText={(text) => handleInputChange('amount', text)}
                      keyboardType="numeric"
                    />
                  </LinearGradient>
                </View>

                {/* Display equivalent amount */}
                {formData.amount && !isPriceLoading && priceInfo && (
                  <Text className="text-gray-700 text-sm mb-4 text-center">
                    {displayEquivalentAmount(equivalentAmount, formData.inputCurrency ?? 'USDT')}
                  </Text>
                )}
                {isPriceLoading && formData.amount && (
                  <Text className="text-gray-700 text-sm mb-4 text-center">Calculating...</Text>
                )}
                {priceError && <Text className="text-red-500 text-xs mb-4">Error fetching price</Text>}

                {/* Validation errors */}
                {errors.amount && <Text className="text-red-500 text-xs mb-4">{errors.amount}</Text>}
                {errors.inputCurrency && <Text className="text-red-500 text-xs mb-4">{errors.inputCurrency}</Text>}
                {errors.senderAddress && <Text className="text-red-500 text-xs mb-4">{errors.senderAddress}</Text>}
                {error && <Text className="text-red-500 text-xs mb-4">{error.message}</Text>}

                <Button title="Exchange" onPress={handleTrade} isLandscape={isLandscape} width="full" />
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmationModal
        visible={isConfirmModalVisible}
        title="Confirm Exchange"
        message={`Are you sure you want to ${tradeType} ${equivalentAmount} ${outputCurrency} using ${formData.amount} ${formData.inputCurrency}?`}
        onConfirm={submitTrade}
        onCancel={() => setConfirmModalVisible(false)}
        isPending={isPending}
        isLandscape={isLandscape}
      />

      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    overflow: 'hidden',
  },
  input: {
    borderRadius: 999,
  },
  exchangeContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default Exchange;