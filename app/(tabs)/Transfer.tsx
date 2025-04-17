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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

// Custom hooks
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';

// Components
import Header from '@/components/Header';
import Button from '@/components/Button';
import ConfirmationModal from '../modals/confirmationModal';
import BalanceDetails from '@/components/BalancesDetails';

// Libraries & utils
import * as SecureStore from 'expo-secure-store';
import { validateForm } from '../validators/helpers';
import { transcationSchema } from '../validators/transaction.validator';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// API hooks
import { useTransferPRX, useTransferUSDT } from '../hooks/transactions-hooks/transfer.hooks';
import { useGetWalletInfo } from '../hooks/wallet-info-hooks/balances.hooks';
import { useGetPrice } from '../hooks/transactions-hooks/price.hooks';

// Types
import { TransactionType, TransferData } from '../models/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TransferScreen: React.FC = () => {
   const insets = useSafeAreaInsets();
  const router = useRouter(); // For navigation
  const isLandscape = useOrientation(); // Detect screen orientation
  const handleBack = useHandleBack(); // Back button behavior

  // Form state
  const [formData, setFormData] = useState<TransferData>({
    amount: '',
    senderAddress: '',
    receiverAddress: '',//other field are useless in these operations
  });

  // State for toggling balance/coin display
  const [selectedBalance, setSelectedBalance] = useState<'Proxym' | 'USDT'>('Proxym');
  const [selectedCoin, setSelectedCoin] = useState<'PRX' | 'USDT'>('PRX');

  // Error handling
  const [errors, setErrors] = useState<Partial<TransferData>>({});

  // Modal state
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

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
    const { errors, success } = await validateForm(formData, transcationSchema);


    if (success) {
      if (!formData.senderAddress) {
        setErrors((prev) => ({ ...prev, senderAddress: 'Sender address is required' }));
        return;
      }
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setErrors((prev) => ({ ...prev, amount: 'Please enter a valid amount' }));
        return;
      }

      // Show confirmation modal before proceeding
      setConfirmModalVisible(true);
    } else {
      setErrors(errors);
    }


  };

  // Show loading screen while wallet info is loading
  if (isWalletLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text>Loading wallet information...</Text>
      </SafeAreaView>
    );
  }

  // Show error message if wallet fetch fails
  if (walletError) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Text className="text-red-500">Error: {walletError.message}</Text>
      </SafeAreaView>
    );
  }

  // Refetch wallet and price information (pull-to-refresh)
  const updateWAlletData = () => {
    priceRefetch();
    walletRefetch();
  };
   const handleHistoryIcon = () =>{
      router.push({
        pathname: '/screens/history.screen',
        params: { transactionType: TransactionType.TRANSFER },
      });
    }


  return (
    <SafeAreaView className="flex-1 bg-white">
          <View
        className="absolute top-0 left-0 right-0 z-40 bg-transparent"
        style={{ paddingTop: insets.top }}
      >
        <Header title="Profile" onHistoryPress={handleHistoryIcon} isLandscape={isLandscape} backEnabled={false} historyEnabled={true}  />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', }}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl className='flex-1 absolute z-50'
              refreshing={isWalletLoading || isPriceLoading}
              onRefresh={updateWAlletData}
              style={{ flexGrow: 1, justifyContent: 'center', zIndex : 40 }}
            />
          }
        >
  

          {/* Display balance info */}
          <View className="items-center mt-20">
          <BalanceDetails 
            walletInfo={walletInfo}
            selectedBalance={selectedBalance}
            onToggleBalance={() =>
              setSelectedBalance(selectedBalance === 'Proxym' ? 'USDT' : 'Proxym')
            }
            isLandscape={isLandscape}
            price={priceInfo ?? 0}
          />
          </View>

          {/* Refresh tip */}
          {!isWalletLoading && (
            <View className="mt-4 p-2 bg-white rounded">
              <Text className="text-pink-700 text-center text-sm">
                Swipe down to refresh your balance details
              </Text>
            </View>
          )}

          {/* Transfer form container */}
          <View className="flex-1 items-center justify-center my-8 ">
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-3xl p-[2px] w-10/12 max-w-md"
              style={styles.gradient}
            >
              <View className="bg-white rounded-3xl p-6" style={styles.transferContainer}>
                <Text
                  className={`text-black text-center font-semibold ${isLandscape ? 'text-lg' : 'text-xl'
                    } mb-5`}
                >
                  Transfer
                </Text>

                {/* Toggle between PRX / USDT */}
                <View className="flex-row items-center mb-4">
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
                      className={`w-full bg-white text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                        }`}
                      style={styles.input}
                      placeholder="Amount"
                      placeholderTextColor="#9CA3AF"
                      value={formData.amount}
                      onChangeText={(text) => handleInputChange('amount', text)}
                      keyboardType="numeric"
                    />
                  </LinearGradient>
                </View>
                {errors.amount && (
                  <Text className="text-red-500 text-xs mb-4">{errors.amount}</Text>
                )}

                {/* Recipient address */}
                <View className="mb-6">
                  <Text className="text-gray-500 text-sm mb-2">Recipient address</Text>
                  <LinearGradient
                    colors={['#A855F7', '#F472B6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-full p-[2px]"
                    style={styles.gradient}
                  >
                    <TextInput
                      className={`w-full bg-white text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                        }`}
                      style={styles.input}
                      placeholder="Recipient address"
                      placeholderTextColor="#9CA3AF"
                      value={formData.receiverAddress}
                      onChangeText={(text) => handleInputChange('receiverAddress', text)}
                      autoCapitalize="none"
                    />
                  </LinearGradient>
                  {errors.receiverAddress && (
                    <Text className="text-red-500 text-xs mt-1 text-center">{errors.receiverAddress}</Text>
                  )}
                </View>

                {/* Sender address or server errors */}
                {errors.senderAddress && (
                  <Text className="text-red-500 text-xs mb-4 text-center">{errors.senderAddress}</Text>
                )}
                {transferError && (
                  <Text className="text-red-500 text-xs mb-4 text-center ">{transferError.message}</Text>
                )}

                {/* Transfer button */}
                <Button
                  title="Transfer"
                  onPress={handleTransfer}
                  isLandscape={isLandscape}
                  width="full"
                />
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

      <StatusBar style="dark" translucent={false} />
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
