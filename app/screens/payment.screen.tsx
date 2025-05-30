import React, { useState, useRef, useEffect } from 'react';
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
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useStripe } from '@stripe/stripe-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

// Custom hooks
import { useOrientation } from '../hooks/shared/useOrientation';
import { useBiometricAuth } from '../hooks/shared/useBiometricAuth';

// Components
import Header from '@/app/components/Header';
import Button from '@/app/components/Button';
import SuccessModal from '../components/SuccessModal';
import BalanceDetails from '../components/BalancesDetails';

// API
import axiosInstance from '../interceptors/axiosInstance';
import { useGetWalletInfo } from '../hooks/wallet-info-hooks/balances.hooks';
import { useGetPrice } from '../hooks/transactions-hooks/price.hooks';
import { TransactionType } from '../models/transaction';

interface IntentResponse {
  clientSecret: string;
}

type TradeMode = 'buy' | 'sell';

const TradeTokensScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isLandscape = useOrientation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { isBiometricSupported, authenticate, error: biometricError } = useBiometricAuth();

  // State for tracking animation
  const hasAnimated = useRef(false);

  // Wallet details
  useEffect(() => {
    const fetchUserWalletAddress = async () => {
      const address = await SecureStore.getItemAsync('walletAddress');
      if(!address){
        throw new Error;
      }
      setWalletAddress(address);
    };
    fetchUserWalletAddress();
  }, []);

  // Form state
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [tradeMode, setTradeMode] = useState<TradeMode>('buy');
  const [prxAmount, setPrxAmount] = useState<string>('');
  const [cardDetails, setCardDetails] = useState({
    name: '',
    email: '',
    cardNumber: '',
    expDate: '',
    cvc: '',
  });
  const [errors, setErrors] = useState<{
    amount?: string;
    name?: string;
    email?: string;
    cardNumber?: string;
    expDate?: string;
    cvc?: string;
    general?: string;
  }>({});
  const [selectedBalance, setSelectedBalance] = useState<'Proxym' | 'USDT'>('Proxym');
  const [selectedCoin, setSelectedCoin] = useState<'PRX' | 'USDT'>('PRX');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Get wallet and price info
  const { data: walletInfo, isLoading: isWalletLoading, refetch: walletRefetch } =
    useGetWalletInfo(walletAddress);
  const { data: priceInfo, isLoading: isPriceLoading, refetch: priceRefetch } = useGetPrice();

  // Refs for input focus management
  const emailInputRef = useRef(null);
  const cardNumberInputRef = useRef(null);
  const expDateInputRef = useRef(null);
  const cvcInputRef = useRef(null);

  // Update wallet data
  const updateWalletData = () => {
    priceRefetch();
    walletRefetch();
  };

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '');
    const groups = [];
    
    for (let i = 0; i < cleaned.length; i += 4) {
      groups.push(cleaned.substr(i, 4));
    }
    
    return groups.join(' ');
  };

  // Format expiration date
  const formatExpDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length <= 2) {
      return cleaned;
    }
    
    return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
  };

  const validateForm = () => {
    const newErrors: any = {};
    let isValid = true;

    // Amount validation
    if (!prxAmount || parseFloat(prxAmount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
      isValid = false;
    }

    // Card details validation for sell mode
    if (tradeMode === 'sell') {
      if (!cardDetails.name.trim()) {
        newErrors.name = 'Please enter your name';
        isValid = false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!cardDetails.email.trim() || !emailRegex.test(cardDetails.email)) {
        newErrors.email = 'Please enter a valid email address';
        isValid = false;
      }
      
      if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
        isValid = false;
      }
      
      if (!cardDetails.expDate || cardDetails.expDate.length !== 5) {
        newErrors.expDate = 'Enter a valid expiry date (MM/YY)';
        isValid = false;
      }
      
      if (!cardDetails.cvc || cardDetails.cvc.length < 3) {
        newErrors.cvc = 'Enter a valid CVC (3-4 digits)';
        isValid = false; 
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleTradeTokens = async () => {
    // Clear previous errors
    setErrors({});

    // Form validation
    if (!validateForm()) return;

    // Biometric authentication if available
    if (isBiometricSupported) {
      const isAuthenticated = await authenticate();
      if (!isAuthenticated) {
        setErrors({ general: biometricError || 'Biometric verification failed' });
        return;
      }
    }

    try {
      if (tradeMode === 'buy') {
        // Buy tokens
        const response = await axiosInstance.post<IntentResponse>('/payment/create-payment-intent', {
          amount: parseFloat(prxAmount),
          senderAddress: walletAddress,
          currency: selectedCoin,
        });

        const { clientSecret } = response.data;
        if (!clientSecret) throw new Error('Missing client secret from backend');

        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'Proxym App',
          allowsDelayedPaymentMethods: true,
          defaultBillingDetails: { name: 'Marwen', email: 'Marwen@gmail.com' },
        });

        if (initError) {
          setErrors({ general: `Payment initialization failed: ${initError.message}` });
          return;
        }

        const { error: presentError } = await presentPaymentSheet();
        if (presentError) {
          if (presentError.code !== 'Canceled') {
            setErrors({ general: `Payment failed: ${presentError.message}` });
          }
          return;
        }

        await axiosInstance.post('/payment/confirm-payment', {
          paymentIntentId: clientSecret.split('_secret_')[0],
        });
      } else {
        // Sell tokens
        const response = await axiosInstance.post<IntentResponse>('/payment/sell-crypto', {
          amount: parseFloat(prxAmount),
          userAddress: walletAddress,
          currency: selectedCoin,
          cardDetails: {
            name: cardDetails.name,
            email: cardDetails.email,
            paymentMethodId: 'pm_card_visa',
          },
        });

        const paymentId = response.data.clientSecret.split('_secret_')[0];
        if (!paymentId) throw new Error('Missing payout intent ID from backend');

        await axiosInstance.post('/payment/confirm-sell', {
          payoutIntentId: paymentId,
        });
      }

      // Success
      setPrxAmount('');
      if (tradeMode === 'sell') {
        setCardDetails({ name: '', email: '', cardNumber: '', expDate: '', cvc: '' });
      }
      setSuccessMessage(
        `Successfully ${tradeMode === 'buy' ? 'purchased' : 'sold'} ${prxAmount} ${selectedCoin}! 🚀`,
      );
      setIsSuccessModalVisible(true);
      updateWalletData();
    } catch (error: any) {
      setErrors({ general: `Failed to process ${tradeMode}: ${error.message || 'Unknown error'}` });
    }
  };

  const handleHistoryIcon = () => {
    router.push({
      pathname: '/screens/history-payment.screen',
      
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <Animated.View
        entering={hasAnimated.current ? undefined : FadeIn.duration(600)}
        className="absolute top-0 left-0 right-0 z-40 bg-white"
        style={{ paddingTop: insets.top  }}
      >
        <Header
          title={`${tradeMode === 'buy' ? 'Buy' : 'Sell'} Tokens`}
          onHistoryPress={handleHistoryIcon}
          isLandscape={isLandscape}
          backEnabled={true}
          onBackPress={() => router.back()}
          historyEnabled={true}
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingBottom: insets.bottom + 50,
            paddingTop :insets.top + 50
          }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={isWalletLoading || isPriceLoading} onRefresh={updateWalletData} />
          }
        >
          {/* Current balance display 
          <Animated.View
            entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(200)}
            className="items-center mt-20"
            onLayout={() => (hasAnimated.current = true)}
          >
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

          {/* Refresh tip */}
           {/*{!isWalletLoading && (
            <Animated.View
              entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(300)}
              className="mt-4 p-2 bg-white rounded"
            >
              <Text className="text-pink-700 text-center text-sm">
                Swipe down to refresh your balance details
              </Text>
            </Animated.View>
          )}

          {/* Trade form container */}
          <View className="flex-1 items-center justify-center my-8">
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-3xl p-[2px] w-10/12 max-w-md"
              style={styles.gradient}
            >
              <View className="bg-white rounded-3xl p-6" style={styles.formContainer}>
                {/* Toggle Buy/Sell */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(500)}
                  className="flex-row justify-center mb-4"
                >
                  <TouchableOpacity
                    onPress={() => {
                      setTradeMode('buy');
                      setErrors({});
                    }}
                    className={`px-4 py-2 rounded-l-full ${
                      tradeMode === 'buy' ? 'bg-black' : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-base ${tradeMode === 'buy' ? 'text-white' : 'text-black'}`}
                    >
                      Buy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setTradeMode('sell');
                      setErrors({});
                    }}
                    className={`px-4 py-2 rounded-r-full ${
                      tradeMode === 'sell' ? 'bg-black' : 'bg-gray-200'
                    }`}
                  >
                    <Text
                      className={`text-base ${tradeMode === 'sell' ? 'text-white' : 'text-black'}`}
                    >
                      Sell
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                {/* Coin and Amount */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(600)}
                  className="flex-row items-center mb-2"
                >
                  <TouchableOpacity
                    onPress={() => setSelectedCoin(selectedCoin === 'PRX' ? 'USDT' : 'PRX')}
                    className="mr-2"
                  >
                    <View className="bg-black rounded-full px-4 py-2">
                      <Text className="text-white text-base">{selectedCoin}</Text>
                    </View>
                  </TouchableOpacity>
                  <LinearGradient
                    colors={['#A855F7', '#F472B6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-full p-[2px] flex-1"
                    style={styles.gradient}
                  >
                    <TextInput
                      className={`w-full bg-white text-black ${
                        isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                      }`}
                      style={styles.input}
                      placeholder="Amount"
                      placeholderTextColor="#9CA3AF"
                      value={prxAmount}
                      onChangeText={(text) => {
                        setPrxAmount(text.replace(/[^0-9.]/g, ''));
                        if (errors.amount) setErrors({ ...errors, amount: undefined });
                      }}
                      keyboardType="numeric"
                      returnKeyType="next"
                      onSubmitEditing={() => {
                        if (tradeMode === 'sell') {
                          // @ts-ignore
                          emailInputRef?.current?.focus();
                        }
                      }}
                    />
                  </LinearGradient>
                </Animated.View>

                {/* Amount error message */}
                {errors.amount && (
                  <Text className="text-red-500 text-xs mb-3 ml-2">{errors.amount}</Text>
                )}

                {/* Card details for Sell */}
                {tradeMode === 'sell' && (
                  <Animated.View
                    entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(700)}
                    className="mt-4"
                  >
                    <View className="mb-3">
                      <View className="flex-row items-center mb-1">
                        <MaterialCommunityIcons name="account" size={18} color="#e9d5ff" />
                        <Text className="text-gray-700 text-sm ml-1 mb-1">Full Name</Text>
                      </View>
                      <TextInput
                        className={`w-full bg-gray-50 text-black ${
                          isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                        } rounded-lg`}
                        placeholder="John Doe"
                        placeholderTextColor="#9CA3AF"
                        value={cardDetails.name}
                        onChangeText={(text) => {
                          setCardDetails({ ...cardDetails, name: text });
                          if (errors.name) setErrors({ ...errors, name: undefined });
                        }}
                        returnKeyType="next"
                        onSubmitEditing={() => {
                          // @ts-ignore
                          emailInputRef?.current?.focus();
                        }}
                      />
                      {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>}
                    </View>

                    <View className="mb-3">
                      <View className="flex-row items-center mb-1">
                        <MaterialCommunityIcons name="email" size={18} color="#e9d5ff" />
                        <Text className="text-gray-700 text-sm ml-1 mb-1">Email</Text>
                      </View>
                      <TextInput
                        ref={emailInputRef}
                        className={`w-full bg-gray-50 text-black ${
                          isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                        } rounded-lg`}
                        placeholder="email@example.com"
                        placeholderTextColor="#9CA3AF"
                        value={cardDetails.email}
                        onChangeText={(text) => {
                          setCardDetails({ ...cardDetails, email: text });
                          if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => {
                          // @ts-ignore
                          cardNumberInputRef?.current?.focus();
                        }}
                      />
                      {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
                    </View>

                    <View className="mb-3">
                      <View className="flex-row items-center mb-1">
                        <MaterialCommunityIcons name="credit-card" size={18} color="#e9d5ff" />
                        <Text className="text-gray-700 text-sm ml-1 mb-1">Card Number</Text>
                      </View>
                      <TextInput
                        ref={cardNumberInputRef}
                        className={`w-full bg-gray-50 text-black ${
                          isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                        } rounded-lg`}
                        placeholder="4242 4242 4242 4242"
                        placeholderTextColor="#9CA3AF"
                        value={cardDetails.cardNumber}
                        onChangeText={(text) => {
                          const formattedText = formatCardNumber(text);
                          setCardDetails({ ...cardDetails, cardNumber: formattedText });
                          if (errors.cardNumber) setErrors({ ...errors, cardNumber: undefined });
                        }}
                        keyboardType="numeric"
                        maxLength={19} // 16 digits + 3 spaces
                        returnKeyType="next"
                        onSubmitEditing={() => {
                          // @ts-ignore
                          expDateInputRef?.current?.focus();
                        }}
                      />
                      {errors.cardNumber && (
                        <Text className="text-red-500 text-xs mt-1">{errors.cardNumber}</Text>
                      )}
                    </View>

                    <View className="flex-row">
                      <View className="w-1/2 mr-2">
                        <View className="flex-row items-center mb-1">
                          <MaterialCommunityIcons name="calendar" size={18} color="#e9d5ff" />
                          <Text className="text-gray-700 text-sm ml-1 mb-1">Expiry Date</Text>
                        </View>
                        <TextInput
                          ref={expDateInputRef}
                          className={`w-full bg-gray-50 text-black ${
                            isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                          } rounded-lg`}
                          placeholder="MM/YY"
                          placeholderTextColor="#9CA3AF"
                          value={cardDetails.expDate}
                          onChangeText={(text) => {
                            const formattedText = formatExpDate(text);
                            setCardDetails({ ...cardDetails, expDate: formattedText });
                            if (errors.expDate) setErrors({ ...errors, expDate: undefined });
                          }}
                          keyboardType="numeric"
                          maxLength={5} // MM/YY
                          returnKeyType="next"
                          onSubmitEditing={() => {
                            // @ts-ignore
                            cvcInputRef?.current?.focus();
                          }}
                        />
                        {errors.expDate && (
                          <Text className="text-red-500 text-xs mt-1">{errors.expDate}</Text>
                        )}
                      </View>
                      
                      <View className="w-1/2">
                        <View className="flex-row items-center mb-1">
                          <MaterialCommunityIcons name="lock" size={18} color="#e9d5ff" />
                          <Text className="text-gray-700 text-sm ml-1 mb-1">CVC</Text>
                        </View>
                        <TextInput
                          ref={cvcInputRef}
                          className={`w-full bg-gray-50 text-black ${
                            isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                          } rounded-lg`}
                          placeholder="123"
                          placeholderTextColor="#9CA3AF"
                          value={cardDetails.cvc}
                          onChangeText={(text) => {
                            setCardDetails({ ...cardDetails, cvc: text.replace(/\D/g, '') });
                            if (errors.cvc) setErrors({ ...errors, cvc: undefined });
                          }}
                          keyboardType="numeric"
                          maxLength={4}
                          secureTextEntry={true}
                        />
                        {errors.cvc && <Text className="text-red-500 text-xs mt-1">{errors.cvc}</Text>}
                      </View>
                    </View>
                  </Animated.View>
                )}

                {/* Price/Payout estimate */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(1000)}
                  className="mb-6 mt-4"
                >
                  <Text className="text-gray-500 text-sm text-center">
                    {prxAmount && !isNaN(parseFloat(prxAmount)) && priceInfo
                      ? `Estimated ${tradeMode === 'buy' ? 'cost' : 'payout'}: $${(
                          parseFloat(prxAmount) * (selectedCoin === 'PRX' ? priceInfo : 1)
                        ).toFixed(2)}`
                      : `Enter an amount to see the ${tradeMode === 'buy' ? 'cost' : 'payout'} estimate`}
                  </Text>
                </Animated.View>

                {/* Payment/Payout method info */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(1100)}
                  className="mb-6"
                >
                  <View className="bg-gray-50 p-4 rounded-lg">
                    <View className="flex-row items-center mb-2">
                      <MaterialCommunityIcons
                        name={tradeMode === 'buy' ? 'credit-card-outline' : 'bank-outline'}
                        size={20}
                        color="#e9d5ff"
                      />
                      <Text className="text-gray-600 text-sm ml-2 font-medium">
                        {tradeMode === 'buy' ? 'Payment' : 'Payout'} Method
                      </Text>
                    </View>
                    <Text className="text-gray-500 text-xs">
                      Secure {tradeMode === 'buy' ? 'payments' : 'payouts'} processed via Stripe.{' '}
                      {tradeMode === 'buy'
                        ? 'Your card details are never stored on our servers.'
                        : 'Funds will be transferred to your provided card.'}
                    </Text>
                  </View>
                </Animated.View>

                {/* General error message */}
                {errors.general && (
                  <Animated.View
                    entering={hasAnimated.current ? undefined : FadeIn.duration(600).delay(1200)}
                  >
                    <Text className="text-red-500 text-xs mb-4 text-center">{errors.general}</Text>
                  </Animated.View>
                )}

                {/* Trade button */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(1300)}
                >
                  <Button
                    title={`${tradeMode === 'buy' ? 'Buy' : 'Sell'} ${selectedCoin}`}
                    onPress={handleTradeTokens}
                    isLandscape={isLandscape}
                    width="full"
                  />
                </Animated.View>

                {/* Test card info */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(1400)}
                  className="mt-4"
                >
                  <Text className="text-gray-400 text-xs text-center">
                    Test mode: Use card 4242 4242 4242 4242, any future date, any CVC, any ZIP.
                  </Text>
                </Animated.View>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        isVisible={isSuccessModalVisible}
        title={`${tradeMode === 'buy' ? 'Purchase' : 'Sale'} Complete!`}
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

// Style definitions
const styles = StyleSheet.create({
  gradient: {
    overflow: 'hidden',
  },
  input: {
    borderRadius: 999,
  },
  formContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default TradeTokensScreen;