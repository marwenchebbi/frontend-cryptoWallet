import React, { useState, useRef } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

interface PayoutIntentResponse {
  clientSecret: string;
}

const SellTokensScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isLandscape = useOrientation();
  const { isBiometricSupported, authenticate, error: biometricError } = useBiometricAuth();

  // State for tracking animation
  const hasAnimated = useRef(false);

  // Wallet details
  const walletAddress = '0x28C0b92A44f84cadfbbaefD8b989e368722155A0';

  // Form state
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
    cardDetails?: string;
    general?: string;
  }>({});

  // State for toggling balance/coin display
  const [selectedBalance, setSelectedBalance] = useState<'Proxym' | 'USDT'>('Proxym');
  const [selectedCoin, setSelectedCoin] = useState<'PRX' | 'USDT'>('PRX');

  // Success modal state
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Get wallet info
  const {
    data: walletInfo,
    isLoading: isWalletLoading,
    refetch: walletRefetch,
  } = useGetWalletInfo(walletAddress);

  // Get price info
  const {
    data: priceInfo,
    isLoading: isPriceLoading,
    refetch: priceRefetch,
  } = useGetPrice();

  // Update wallet data
  const updateWalletData = () => {
    priceRefetch();
    walletRefetch();
  };

  const handleSellTokens = async () => {
    // Form validation
    if (!prxAmount || parseFloat(prxAmount) <= 0) {
      setErrors({ amount: 'Please enter a valid amount' });
      return;
    }

    if (!cardDetails.name || !cardDetails.email || !cardDetails.cardNumber) {
      setErrors({ cardDetails: 'Please provide complete card details' });
      return;
    }

    // Clear previous errors
    setErrors({});

    // Biometric authentication if available
    if (isBiometricSupported) {
      const isAuthenticated = await authenticate();
      if (!isAuthenticated) {
        setErrors({ general: biometricError || 'Biometric verification failed' });
        return;
      }
    }

    try {
      // Step 1: Create sell crypto intent
      const response = await axiosInstance.post<PayoutIntentResponse>('/payment/sell-crypto', {
        amount: parseFloat(prxAmount),
        userAddress: walletAddress,
        currency: selectedCoin,
        cardDetails: {
          name: cardDetails.name,
          email: cardDetails.email,
          paymentMethodId: 'pm_card_visa', // For testing, use Stripe test card
        },
      });


const paymentId =  response.data.clientSecret.split('_secret_')[0];
console.log(paymentId)

      if (!paymentId) {
        throw new Error('Missing payout intent ID from backend');
      }

      // Step 2: Confirm sell transaction
      await axiosInstance.post('/payment/confirm-sell', {
       payoutIntentId : paymentId,
      });

      // Success! Reset form and show success modal
      setPrxAmount('');
      setCardDetails({ name: '', email: '', cardNumber: '', expDate: '', cvc: '' });
      setSuccessMessage(`Successfully sold ${prxAmount} ${selectedCoin}! 🚀`);
      setIsSuccessModalVisible(true);
      updateWalletData();
    } catch (error: any) {
      setErrors({ general: `Failed to process sale: ${error.message || 'Unknown error'}` });
    }
  };

  const handleHistoryIcon = () => {
    router.push({
      pathname: '/screens/history.screen',
      params: { transactionType: TransactionType.PAYMENT },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <Animated.View
        entering={hasAnimated.current ? undefined : FadeIn.duration(600)}
        className="absolute top-0 left-0 right-0 z-40 bg-white"
        style={{ paddingTop: insets.top }}
      >
        <Header
          title="Sell Tokens"
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
          }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isWalletLoading || isPriceLoading}
              onRefresh={updateWalletData}
            />
          }
        >
          {/* Current balance display section */}
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
          {!isWalletLoading && (
            <Animated.View
              entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(300)}
              className="mt-4 p-2 bg-white rounded"
            >
              <Text className="text-pink-700 text-center text-sm">
                Swipe down to refresh your balance details
              </Text>
            </Animated.View>
          )}

          {/* Sell tokens form container */}
          <View className="flex-1 items-center justify-center my-8">
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-3xl p-[2px] w-10/12 max-w-md"
              style={styles.gradient}
            >
              <View className="bg-white rounded-3xl p-6" style={styles.formContainer}>
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(500)}
                >
                  <Text
                    className={`text-black text-center font-semibold ${
                      isLandscape ? 'text-lg' : 'text-xl'
                    } mb-5`}
                  >
                    Sell Tokens
                  </Text>
                </Animated.View>

                {/* Toggle between PRX / USDT */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(600)}
                  className="flex-row items-center mb-4"
                >
                  <TouchableOpacity
                    onPress={() => setSelectedCoin(selectedCoin === 'PRX' ? 'USDT' : 'PRX')}
                  >
                    <View className="bg-black rounded-full px-4 py-2">
                      <Text className="text-white text-base">{selectedCoin}</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Amount input */}
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
                      value={prxAmount}
                      onChangeText={setPrxAmount}
                      keyboardType="numeric"
                    />
                  </LinearGradient>
                </Animated.View>

                {/* Card details inputs */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(700)}
                  className="mb-4"
                >
                  <TextInput
                    className={`w-full bg-gray-50 text-black ${
                      isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                    } mb-2 rounded-lg`}
                    placeholder="Full Name"
                    placeholderTextColor="#9CA3AF"
                    value={cardDetails.name}
                    onChangeText={(text) => setCardDetails({ ...cardDetails, name: text })}
                  />
                  <TextInput
                    className={`w-full bg-gray-50 text-black ${
                      isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                    } mb-2 rounded-lg`}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={cardDetails.email}
                    onChangeText={(text) => setCardDetails({ ...cardDetails, email: text })}
                    keyboardType="email-address"
                  />
                  <TextInput
                    className={`w-full bg-gray-50 text-black ${
                      isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                    } mb-2 rounded-lg`}
                    placeholder="Card Number (Test: 4242 4242 4242 4242)"
                    placeholderTextColor="#9CA3AF"
                    value={cardDetails.cardNumber}
                    onChangeText={(text) => setCardDetails({ ...cardDetails, cardNumber: text })}
                    keyboardType="numeric"
                  />
                  <View className="flex-row">
                    <TextInput
                      className={`w-1/2 bg-gray-50 text-black ${
                        isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                      } mr-2 rounded-lg`}
                      placeholder="MM/YY"
                      placeholderTextColor="#9CA3AF"
                      value={cardDetails.expDate}
                      onChangeText={(text) => setCardDetails({ ...cardDetails, expDate: text })}
                    />
                    <TextInput
                      className={`w-1/2 bg-gray-50 text-black ${
                        isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                      } rounded-lg`}
                      placeholder="CVC"
                      placeholderTextColor="#9CA3AF"
                      value={cardDetails.cvc}
                      onChangeText={(text) => setCardDetails({ ...cardDetails, cvc: text })}
                      keyboardType="numeric"
                    />
                  </View>
                </Animated.View>

                {/* Error messages */}
                {errors.amount && (
                  <Animated.View
                    entering={hasAnimated.current ? undefined : FadeIn.duration(600).delay(800)}
                  >
                    <Text className="text-red-500 text-xs mb-4">{errors.amount}</Text>
                  </Animated.View>
                )}
                {errors.cardDetails && (
                  <Animated.View
                    entering={hasAnimated.current ? undefined : FadeIn.duration(600).delay(900)}
                  >
                    <Text className="text-red-500 text-xs mb-4">{errors.cardDetails}</Text>
                  </Animated.View>
                )}

                {/* Price estimate */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(1000)}
                  className="mb-6 mt-2"
                >
                  <Text className="text-gray-500 text-sm text-center">
                    {prxAmount && !isNaN(parseFloat(prxAmount)) && priceInfo
                      ? `Estimated payout: $${(
                          parseFloat(prxAmount) * (selectedCoin === 'PRX' ? priceInfo : 1)
                        ).toFixed(2)}`
                      : 'Enter an amount to see the payout estimate'}
                  </Text>
                </Animated.View>

                {/* Payment method info */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(1100)}
                  className="mb-6"
                >
                  <View className="bg-gray-50 p-4 rounded-lg">
                    <View className="flex-row items-center mb-2">
                      <MaterialCommunityIcons name="bank-outline" size={20} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-2 font-medium">Payout Method</Text>
                    </View>
                    <Text className="text-gray-500 text-xs">
                      Secure payouts processed via Stripe. Funds will be transferred to your provided card.
                    </Text>
                  </View>
                </Animated.View>

                {/* General error message */}
                {errors.general && (
                  <Animated.View
                    entering={hasAnimated.current ? undefined : FadeIn.duration(600).delay(1200)}
                  >
                    <Text className="text-red-500 text-xs mb-4 text-center">
                      {errors.general}
                    </Text>
                  </Animated.View>
                )}

                {/* Sell button */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(1300)}
                >
                  <Button
                    title={`Sell ${selectedCoin}`}
                    onPress={handleSellTokens}
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
        title="Sale Complete!"
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

export default SellTokensScreen;