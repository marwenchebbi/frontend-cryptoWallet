import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// Custom hooks
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';

// UI Components
import Header from '@/app/components/Header';
import Button from '@/app/components/Button';

import SuccessModal from '../components/SuccessModal'; // Import SuccessModal

// Utilities and validation
import * as SecureStore from 'expo-secure-store';
import { validateForm } from '../validators/helpers';
import { transcationSchema } from '../validators/transaction.validator';

// Hooks for handling transactions and wallet info
import { useBuyPRX, useSellPRX } from '../hooks/transactions-hooks/exchange.hooks';
import { useGetWalletInfo } from '../hooks/wallet-info-hooks/balances.hooks';
import { useGetPrice } from '../hooks/transactions-hooks/price.hooks';

// Types and modals
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useBiometricAuth } from '../hooks/shared/useBiometricAuth';
import { TransactionType, TransferData } from '../models/transaction';
import BalanceDetails from '../components/BalancesDetails';
import ConfirmationModal from '../components/confirmationModal';

const Exchange: React.FC = () => {
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const insets = useSafeAreaInsets();
  const { isBiometricSupported, authenticate, error: biometricError } = useBiometricAuth();

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
  const [errors, setErrors] = useState<Partial<TransferData & { general: string }>>({});
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false); // State for SuccessModal
  const [successMessage, setSuccessMessage] = useState<string>(''); // Success message

  // Select mutation based on trade type
  const { mutate, isPending, error } = tradeType === 'buy' ? useBuyPRX() : useSellPRX();

  // Fetch wallet and price data
  const {
    data: walletInfo,
    isLoading: isWalletLoading,
    error: walletError,
    refetch: walletRefetch,
  } = useGetWalletInfo(formData.senderAddress);
  const {
    data: priceInfo,
    isLoading: isPriceLoading,
    error: priceError,
    refetch: priceRefetch,
  } = useGetPrice();

  // Fetch wallet address from secure storage
  const fetchSenderAddress = async () => {
    const senderAddress = await SecureStore.getItemAsync('walletAddress');
    if (senderAddress) {
      setFormData((prev) => ({ ...prev, senderAddress }));
    } else {
      setErrors((prev) => ({ ...prev, senderAddress: 'Sender address not found' }));
    }
  };

  useEffect(() => {
    fetchSenderAddress();
  }, []);

  // Display the equivalent amount message based on trade type and input currency
  const displayEquivalentAmount = (equivalentAmount: string, inputCurrency: 'USDT' | 'PRX'): string => {
    if (tradeType === 'buy') {
      return inputCurrency === 'USDT'
        ? `You will receive ≈ ${equivalentAmount} PRX`
        : `You will spend ≈ ${equivalentAmount} USDT`;
    } else {
      return inputCurrency === 'USDT'
        ? `You will spend ≈ ${equivalentAmount} PRX`
        : `You will receive ≈ ${equivalentAmount} USDT`;
    }
  };

  // Handle input field changes
  const handleInputChange = (field: keyof TransferData, value: string) => {
    

    // Handle input field changes
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Calculate equivalent amount using priceInfo
  const calculateEquivalent = (amount: string): string => {
    if (!amount || !priceInfo || priceInfo <= 0) return '0';
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount)) return '0';

    if (formData.inputCurrency === 'PRX') {
      return (parsedAmount * priceInfo).toFixed(6);
    } else {
      return (parsedAmount / priceInfo).toFixed(6);
    }
  };

  // Submit the trade after confirming in the modal
  const submitTrade = () => {
    const equivalent = calculateEquivalent(formData.amount);
    const updatedFormData = {
      ...formData,
      receivedAmount: equivalent,
    };

    mutate(updatedFormData, {
      onSuccess: async (success: boolean) => {
        if (success) {
          setConfirmModalVisible(false);
          setFormData({
            amount: '',
            senderAddress: formData.senderAddress,
            receiverAddress: '',
            inputCurrency: 'USDT',
          });
          // Show success modal
          setSuccessMessage(
            `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${equivalent} ${tradeType === 'buy' ? 'PRX' : 'USDT'} successfully using ${formData.amount} ${formData.inputCurrency}! 😎`
          );
          setIsSuccessModalVisible(true);
           updateWalletData()
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
    setErrors({});
  };

  // Handle validation, biometric auth, and show confirmation modal
  const handleTrade = async () => {
    const { errors, success } = await validateForm(formData, transcationSchema);
    if (!success) {
      setErrors(errors);
      return;
    }

    if (!formData.senderAddress) {
      setErrors((prev) => ({ ...prev, senderAddress: 'Sender address is required' }));
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrors((prev) => ({ ...prev, amount: 'Please enter a valid amount' }));
      return;
    }

    if (isBiometricSupported) {
      const isAuthenticated = await authenticate();
      if (!isAuthenticated) {
        Alert.alert('Biometric verification failed');
        return;
      }
    }

    setConfirmModalVisible(true);
  };

  // Loading state
  if (isWalletLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Animated.View entering={FadeIn.duration(600)}>
          <Text>Loading wallet information...</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Error state
  if (walletError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Animated.View entering={FadeIn.duration(600)}>
          <Text className="text-red-500">Error: {walletError.message}</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const outputCurrency = tradeType === 'buy' ? 'PRX' : 'USDT';
  const equivalentAmount = calculateEquivalent(formData.amount);

  const handleHistoryIcon = () => {
    router.push({
      pathname: '/screens/history.screen',
      params: { transactionType: TransactionType.TRADING },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View
        entering={FadeIn.duration(600)}
        className="absolute top-0 left-0 right-0 z-40 bg-transparent"
        style={{ paddingTop: insets.top }}
      >
        <Header
          title="Exchange"
          onHistoryPress={handleHistoryIcon}
          isLandscape={isLandscape}
          backEnabled={false}
          historyEnabled={true}
        />
      </Animated.View>
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
          <Animated.View entering={FadeInDown.duration(600).delay(200)} className="mt-20">
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

          <Animated.View entering={FadeInDown.duration(600).delay(300)} className="mt-4 p-2 bg-white rounded">
            {!isWalletLoading && (
              <Text className="text-pink-700 text-sm text-center">
                Swipe down to refresh your balance details
              </Text>
            )}
          </Animated.View>

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
                <Animated.View entering={FadeInDown.duration(600).delay(500)} className="flex-row bg-gray-200 rounded-full p-1 mb-6">
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${tradeType === 'buy' ? 'bg-black' : ''}`}
                    onPress={() => setTradeType('buy')}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        tradeType === 'buy' ? 'text-white' : 'text-black'
                      }`}
                    >
                      Buy PRX
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${tradeType === 'sell' ? 'bg-black' : ''}`}
                    onPress={() => setTradeType('sell')}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        tradeType === 'sell' ? 'text-white' : 'text-black'
                      }`}
                    >
                      Sell PRX
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                {/* Input Currency Toggle */}
                <Animated.View entering={FadeInDown.duration(600).delay(600)} className="p-2 bg-white rounded">
                  {!isWalletLoading && (
                    <Text className="text-gray-500 text-center">Choose the Currency to trade with</Text>
                  )}
                </Animated.View>
                <Animated.View
                  entering={FadeInDown.duration(600).delay(700)}
                  className="flex-row bg-gray-200 rounded-full p-1 mb-6"
                >
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${
                      formData.inputCurrency === 'USDT' ? 'bg-black' : ''
                    }`}
                    onPress={() => handleInputChange('inputCurrency', 'USDT')}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        formData.inputCurrency === 'USDT' ? 'text-white' : 'text-black'
                      }`}
                    >
                      USDT
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${
                      formData.inputCurrency === 'PRX' ? 'bg-black' : ''
                    }`}
                    onPress={() => handleInputChange('inputCurrency', 'PRX')}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        formData.inputCurrency === 'PRX' ? 'text-white' : 'text-black'
                      }`}
                    >
                      PRX
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                {/* Amount input field */}
                <Animated.View entering={FadeInDown.duration(600).delay(800)} className="flex-row items-center mb-4">
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
                      className={`w-full bg-white text-black ${
                        isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                      }`}
                      style={styles.input}
                      placeholder="Amount"
                      placeholderTextColor="#9CA3AF"
                      value={formData.amount}
                      onChangeText={(text) => handleInputChange('amount', text)}
                      keyboardType="numeric"
                    />
                  </LinearGradient>
                </Animated.View>

                {/* Display equivalent amount */}
                {formData.amount && !isPriceLoading && priceInfo && (
                  <Animated.Text
                   
                    className="text-gray-700 text-sm mb-4 text-center"
                  >
                    {displayEquivalentAmount(equivalentAmount, formData.inputCurrency ?? 'USDT')}
                  </Animated.Text>
                )}
                {isPriceLoading && formData.amount && (
                  <Animated.Text
                   
                    className="text-gray-700 text-sm mb-4 text-center"
                  >
                    Calculating...
                  </Animated.Text>
                )}
                {priceError && (
                  <Animated.Text
                    
                    className="text-red-500 text-xs mb-4 text-center"
                  >
                    Error fetching price
                  </Animated.Text>
                )}

                {/* Validation errors */}
                {errors.inputCurrency && (
                  <Animated.Text
                    
                    className="text-red-500 text-xs mb-4 text-center"
                  >
                    {errors.inputCurrency}
                  </Animated.Text>
                )}
                {errors.senderAddress && (
                  <Animated.Text
                   
                    className="text-red-500 text-xs mb-4 text-center"
                  >
                    {errors.senderAddress}
                  </Animated.Text>
                )}
                {errors.amount && (
                  <Animated.Text
                  
                    className="text-red-500 text-xs mb-4 text-center"
                  >
                    {errors.amount}
                  </Animated.Text>
                )}
                {errors.general && (
                  <Animated.Text
               
                    className="text-red-500 text-xs mb-4 text-center"
                  >
                    {errors.general}
                  </Animated.Text>
                )}


                <Animated.View entering={FadeInDown.duration(600).delay(1800)}>
                  <Button
                    title="Exchange"
                    onPress={handleTrade}
                    isLandscape={isLandscape}
                    width="full"
                  />
                </Animated.View>
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

      {/* Success Modal */}
      <SuccessModal
        isVisible={isSuccessModalVisible}
        title="Success!"
        message={successMessage}
        onClose={() => {
          setIsSuccessModalVisible(false);
          setSuccessMessage('');
        }}
        duration={2000}
      />

      <StatusBar style="dark" translucent={false} backgroundColor="white" />
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