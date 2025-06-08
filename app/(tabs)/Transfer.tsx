import React, { useState, useEffect, useRef } from 'react';
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

// Custom hooks
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';

// Components
import Header from '@/app/components/Header';
import Button from '@/app/components/Button';

import QRCodeScanner from '../components/QRCodeScanner';
import SuccessModal from '../components/SuccessModal'; // Import SuccessModal

// Libraries & utils
import * as SecureStore from 'expo-secure-store';
import { validateForm } from '../validators/helpers';
import { transcationSchema, transferSchema } from '../validators/transaction.validator';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

// API hooks
import { useTransferPRX, useTransferUSDT } from '../hooks/transactions-hooks/transfer.hooks';
import { useGetWalletInfo } from '../hooks/wallet-info-hooks/balances.hooks';
import { useGetPrice } from '../hooks/transactions-hooks/price.hooks';

// Types
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBiometricAuth } from '../hooks/shared/useBiometricAuth';
import { TransactionType, TransferData } from '../models/transaction';
import BalanceDetails from '../components/BalancesDetails';
import ConfirmationModal from '../components/confirmationModal';

const TransferScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const { isBiometricSupported, authenticate, error: biometricError } = useBiometricAuth();

  // State for scanning
  const [scanning, setScanning] = useState(false);

  // Form state
  const [formData, setFormData] = useState<TransferData>({
    amount: '',
    senderAddress: '',
    receiverAddress: '',
  });

  // State for toggling balance/coin display
  const [selectedBalance, setSelectedBalance] = useState<'Proxym' | 'USDT'>('Proxym');
  const [selectedCoin, setSelectedCoin] = useState<'PRX' | 'USDT'>('PRX');

  // Error handling
  const [errors, setErrors] = useState<Partial<TransferData & { general: string }>>({});

  // Modal state
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false); // State for SuccessModal
  const [successMessage, setSuccessMessage] = useState<string>(''); // Success message

  // Track if animations have run
  const hasAnimated = useRef(false);

  // Dynamic hook depending on coin type
  const {
    mutate: transferMutate,
    isPending: transferPending,
    error: transferError,
  } = selectedCoin === 'PRX' ? useTransferPRX() : useTransferUSDT();

  // Fetch wallet info using sender address
  const {
    data: walletInfo,
    isLoading: isWalletLoading,
    error: walletError,
    refetch: walletRefetch,
  } = useGetWalletInfo(formData.senderAddress);

  // Fetch current prices (PRX to USDT etc.)
  const {
    data: priceInfo,
    isLoading: isPriceLoading,
    error: priceError,
    refetch: priceRefetch,
  } = useGetPrice();

  // Fetch sender address securely from SecureStore
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

  // Handle input updates for form
  const handleInputChange = (field: keyof TransferData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Handle QR code scan result
  const handleBarCodeScanned = (data: string) => {
    handleInputChange('receiverAddress', data);
    setScanning(false); // Close scanner after scanning
  };

  // Handle opening the QR code scanner
  const handleOpenScanner = () => {
    setScanning(true);
  };

  // Called when user confirms the transfer
  const submitTransfer = () => {
    transferMutate(formData, {
      onSuccess: async (success: boolean) => {
        if (success) {
          setConfirmModalVisible(false);
          setFormData({
            amount: '',
            senderAddress: formData.senderAddress,
            receiverAddress: '',
          });
          // Show success modal
          setSuccessMessage(`Transfer of ${formData.amount} ${selectedCoin} completed successfully! 😎`);
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

  // Called when user clicks "Transfer"
  const handleTransfer = async () => {
    const { errors, success } = await validateForm(formData, transferSchema);

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
        setErrors({ amount: biometricError || 'Biometric verification failed' });
        return;
      }
    }

    // Show confirmation modal before proceeding
    setConfirmModalVisible(true);
  };

  // Show loading screen while wallet info is loading
  if (isWalletLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Animated.View entering={FadeIn.duration(600)}>
          <Text>Loading wallet information...</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Show error message if wallet fetch fails
  if (walletError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Animated.View entering={FadeIn.duration(600)}>
          <Text className="text-red-500">Error: {walletError.message}</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Refetch wallet and price information (pull-to-refresh)
  const updateWalletData = () => {
    priceRefetch();
    walletRefetch();
  };

  const handleHistoryIcon = () => {
    router.push({
      pathname: '/screens/history.screen',
      params: { transactionType: TransactionType.TRANSFER },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header (always visible) */}
      <Animated.View
        entering={hasAnimated.current ? undefined : FadeIn.duration(600)}
        className="absolute top-0 left-0 right-0 z-40 bg-white"
        style={{ paddingTop: insets.top }}
      >
        <Header
          title="Transfer"
          onHistoryPress={handleHistoryIcon}
          isLandscape={isLandscape}
          backEnabled={false}
          historyEnabled={true}
          rewardEnbaled={true}
        />
      </Animated.View>

      {/* QR Code Scanner (conditionally visible) */}
      <View className="absolute top-0 left-0 right-0 bottom-0 z-50" style={{ display: scanning ? 'flex' : 'none' }}>
        <QRCodeScanner
          onScan={handleBarCodeScanned}
          onClose={() => setScanning(false)}
        />
      </View>

      {/* Main UI (conditionally visible) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={{ opacity: scanning ? 0 : 1 }} // Hide when scanning
      >
        <Animated.ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingBottom: insets.bottom + 50, // Offset for tab bar and keyboard
          }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isWalletLoading || isPriceLoading}
              onRefresh={updateWalletData}
            />
          }
        >
          {/* Display balance info */}
          <Animated.View
            entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(200)}
            className="items-center mt-20"
            onLayout={() => (hasAnimated.current = true)} // Mark animations as complete
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

          {/* Transfer form container */}
          <View className="flex-1 items-center justify-center my-8">
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-3xl p-[2px] w-10/12 max-w-md"
              style={styles.gradient}
            >
              <View className="bg-white rounded-3xl p-6" style={styles.transferContainer}>
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(500)}
                >
                  <Text
                    className={`text-black text-center font-semibold ${
                      isLandscape ? 'text-lg' : 'text-xl'
                    } mb-5`}
                  >
                    Transfer
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
                      value={formData.amount}
                      onChangeText={(text) => handleInputChange('amount', text)}
                      keyboardType="numeric"
                    />
                  </LinearGradient>
                </Animated.View>
                {errors.amount && (
                  <Animated.View
                   
                  >
                    <Text className="text-red-500 text-xs mb-4">{errors.amount}</Text>
                  </Animated.View>
                )}

                {/* Recipient address with QR code scan icon */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(800)}
                  className="mb-10"
                >
                  <Text className="text-gray-500 text-sm mb-2">Recipient address</Text>
                  <LinearGradient
                    colors={['#A855F7', '#F472B6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-full p-[2px] flex-row items-center"
                    style={styles.gradient}
                  >
                    <TextInput
                      className={`flex-1 bg-white text-black ${
                        isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                      }`}
                      style={styles.input}
                      placeholder="Recipient address"
                      placeholderTextColor="#9CA3AF"
                      value={formData.receiverAddress}
                      onChangeText={(text) => handleInputChange('receiverAddress', text)}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={handleOpenScanner} className="p-2">
                      <MaterialCommunityIcons name="qrcode-scan" size={24} color="white" />
                    </TouchableOpacity>
                  </LinearGradient>
                  {errors.receiverAddress && (
                    <Animated.View
                      entering={hasAnimated.current ? undefined : FadeIn.duration(600).delay(900)}
                    >
                      <Text className="text-red-500 text-xs mt-1 text-center">
                        {errors.receiverAddress}
                      </Text>
                    </Animated.View>
                  )}
                </Animated.View>

                {/* Sender address or server errors */}
                {errors.senderAddress && (
                  <Animated.View
                    entering={hasAnimated.current ? undefined : FadeIn.duration(600).delay(1000)}
                  >
                    <Text className="text-red-500 text-xs mb-4 text-center">
                      {errors.senderAddress}
                    </Text>
                  </Animated.View>
                )}
                {errors.general && (
                  <Animated.View
                    entering={hasAnimated.current ? undefined : FadeIn.duration(600).delay(1100)}
                  >
                    <Text className="text-red-500 text-xs mb-4 text-center">
                      {errors.general}
                    </Text>
                  </Animated.View>
                )}


                {/* Transfer button */}
                <Animated.View
                  entering={hasAnimated.current ? undefined : FadeInDown.duration(600).delay(1200)}
                >
                  <Button
                    title="Transfer"
                    onPress={handleTransfer}
                    isLandscape={isLandscape}
                    width="full"
                  />
                </Animated.View>
              </View>
            </LinearGradient>
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={isConfirmModalVisible}
        title="Confirm Transfer"
        message={`Are you sure you want to transfer ${formData.amount} ${selectedCoin} to ${formData.receiverAddress}?`}
        onConfirm={submitTransfer}
        onCancel={() => setConfirmModalVisible(false)}
        isPending={transferPending}
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

// Style definitions
const styles = StyleSheet.create({
  gradient: {
    overflow: 'hidden',
  },
  input: {
    borderRadius: 999,
  },
  transferContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});

export default TransferScreen;