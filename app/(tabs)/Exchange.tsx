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
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import Header from '@/components/Header';
import Button from '@/components/Button';
import * as SecureStore from 'expo-secure-store';
import { validateForm } from '../validators/helpers';
import { transferSchema } from '../validators/transaction.validator';
import { useBuyPRX, useSellPRX } from '../hooks/transactions-hooks/exchange.hooks';
import { TransferData } from '../models/types';
import ConfirmationModal from '../modals/confirmationModal';
import { useGetWalletInfo } from '../hooks/wallet-info-hooks/balances.hooks';
import BalanceDetails from '@/components/BalancesDetails';

const Exchange: React.FC = () => {

  const isLandscape = useOrientation();
  const handleBack = useHandleBack();

  const [formData, setFormData] = useState<TransferData>({
    amount: '',
    senderAddress: '',
    receiverAddress: '',
  });

  const [selectedBalance, setSelectedBalance] = useState<'Proxym' | 'USDT'>('Proxym');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [errors, setErrors] = useState<Partial<TransferData>>({});
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);

  const { mutate, isPending, error } = tradeType === 'buy' ? useBuyPRX() : useSellPRX();
  const { data: walletInfo, isLoading: isWalletLoading, error: walletError, refetch } = useGetWalletInfo(
    formData.senderAddress
  );

  // Fetch senderAddress from SecureStore
  const fetchSenderAddress = async () => {
    const senderAddress = await SecureStore.getItemAsync('walletAddress');
    if (senderAddress) {
      setFormData((prev) => ({ ...prev, senderAddress }));
    } else {
      setErrors((prev) => ({ ...prev, senderAddress: 'Sender address not found' }));
    }
  };

  React.useEffect(() => {
    fetchSenderAddress();
  }, []);

  const handleInputChange = (field: keyof TransferData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submitTrade = () => {
    mutate(formData, {
      onSuccess: async (success: boolean) => {
        if (success) {
          setConfirmModalVisible(false);
          setFormData({ amount: '', senderAddress: formData.senderAddress, receiverAddress: '' });

        }
      },
      onError: (err: any) => {
        setErrors((prev) => ({ ...prev, general: err.message }));
        setConfirmModalVisible(false);
      },
    });
  };

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
            <RefreshControl refreshing={isWalletLoading} onRefresh={refetch} />
          }
        >
          <Header title="" onBackPress={handleBack} isLandscape={isLandscape} />

          <BalanceDetails
            walletInfo={walletInfo}
            selectedBalance={selectedBalance}
            onToggleBalance={() => setSelectedBalance(selectedBalance === 'Proxym' ? 'USDT' : 'Proxym')}
            isLandscape={isLandscape}
          />

            {/* Refresh text guide */}
            <View className="mt-4 p-2 bg-white rounded">
              {!isWalletLoading && (
                <Text className="text-pink-700 text-center">
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
                <Text
                  className={`text-black text-center font-semibold ${isLandscape ? 'text-lg' : 'text-xl'} mb-5`}
                >
                  Exchange
                </Text>

                <View className="flex-row bg-gray-200 rounded-full p-1 mb-6">
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${tradeType === 'buy' ? 'bg-black' : ''}`}
                    onPress={() => setTradeType('buy')}
                  >
                    <Text
                      className={`text-center font-semibold ${tradeType === 'buy' ? 'text-white' : 'text-black'}`}
                    >
                      Buy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full ${tradeType === 'sell' ? 'bg-black' : ''}`}
                    onPress={() => setTradeType('sell')}
                  >
                    <Text
                      className={`text-center font-semibold ${tradeType === 'sell' ? 'text-white' : 'text-black'}`}
                    >
                      Sell
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row items-center mb-4">
                  <View className="bg-black rounded-full px-4 py-2">
                    <Text className="text-white text-base">{tradeType === 'buy' ? 'USDT' : 'PRX'}</Text>
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
                {errors.amount && <Text className="text-red-500 text-xs mb-4">{errors.amount}</Text>}

                {errors.senderAddress && (
                  <Text className="text-red-500 text-xs mb-4">{errors.senderAddress}</Text>
                )}

                {error && <Text className="text-red-500 text-xs mb-4">{error.message}</Text>}

                <Button
                  title="Exchange"
                  onPress={handleTrade}
                  isLandscape={isLandscape}
                  width="full"
                />
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmationModal
        visible={isConfirmModalVisible}
        title="Confirm Exchange"
        message={`Are you sure you want to ${tradeType} ${formData.amount} ${tradeType === 'buy' ? 'USDT for PRX' : 'PRX for USDT'}?`}
        onConfirm={submitTrade}
        onCancel={() => setConfirmModalVisible(false)}
        isPending={isPending}
        isLandscape={isLandscape}
      />

      <StatusBar style="light" />
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