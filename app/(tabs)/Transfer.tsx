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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RFValue } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import Header from '@/components/Header';
import Button from '@/components/Button';
import * as SecureStore from 'expo-secure-store';
import { validateForm } from '../validators/helpers';
import { transferSchema } from '../validators/transaction.validator';
import { useTransferPRX, useTransferUSDT } from '../hooks/transactions-hooks/transfer.hooks';
import { TransferData } from '../models/types';
import ConfirmationModal from '../modals/confirmationModal'; 

const TransferScreen: React.FC = () => {
  const router = useRouter();
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();

  const [formData, setFormData] = useState<TransferData>({
    amount: '',
    senderAddress: '',
    receiverAddress: '',
  });

  const [selectedBalance, setSelectedBalance] = useState<'Proxym'|'USDT'>('Proxym');
  const [selectedCoin, setSelectedCoin] = useState<'PRX'|'USDT'>('PRX');
  const [errors, setErrors] = useState<Partial<TransferData>>({});
  const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
  const { mutate, isPending, error } = selectedCoin === 'PRX' ? useTransferPRX() : useTransferUSDT();

  // Fetch senderAddress from the wallet address
  const fetchSenderAddress = async () => {
    const senderAddress = await SecureStore.getItemAsync('walletAddress');
    if (senderAddress) {
      setFormData((prev) => ({ ...prev, senderAddress }));
    } else {
      setErrors((prev) => ({ ...prev, senderAddress: 'Sender address not found' }));
    }
  };

  // this hook wil also fetch the balances and the wallet infos
  React.useEffect(() => {
    fetchSenderAddress();
  }, []);


  
  const handleInputChange = (field: keyof TransferData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submitTransfer = () => {
    mutate(formData, {
      onSuccess: async (success: boolean) => {
        if (success) {
          console.log('Transfer successful');
          setConfirmModalVisible(false);
          
        }
      },
      onError: (err: any) => {
        console.log('Transfer error:', err.message);
        setConfirmModalVisible(false);
      },
    });
  };

  const handleTransfer = async () => {
    const { errors, success } = await validateForm(formData, transferSchema);
    if (success) {
      if (!formData.senderAddress) {
        setErrors((prev) => ({ ...prev, senderAddress: 'Sender address is required' }));
        return;
      }
      setConfirmModalVisible(true);
    } else {
      setErrors(errors);
    }
  };

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
        >
          <Header title="" onBackPress={handleBack} isLandscape={isLandscape} />
          
          <View className="items-center mt-6">
            <Text className="text-gray-500 text-sm">Available balance</Text>
            <Text className={`text-black font-bold ${isLandscape ? 'text-3xl' : 'text-4xl'}`}>
              6,500 PRX
            </Text>
            <TouchableOpacity
              className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mt-4"
              onPress={() => setSelectedBalance(selectedBalance == 'Proxym' ? 'USDT' : 'Proxym')}
            >
              <View className="w-2 h-2 bg-black rounded-full mr-2" />
              <Text className="text-black text-base">{selectedBalance}</Text>
              <Ionicons name="swap-horizontal" size={RFValue(16)} color="#000" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center my-8">
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-3xl p-[2px] w-10/12 max-w-md"
              style={styles.gradient}
            >
              <View className="bg-white rounded-3xl p-6" style={styles.transferContainer}>
                <Text
                  className={`text-black text-center font-semibold ${isLandscape ? 'text-lg' : 'text-xl'} mb-5`}
                >
                  Transfer
                </Text>
                
                <View className="flex-row items-center mb-4">
                <TouchableOpacity onPress={() => setSelectedCoin(selectedCoin == 'PRX' ? 'USDT' : 'PRX')}>
                  <View className="bg-black rounded-full px-4 py-2">
                    <Text className="text-white text-base">{selectedCoin}</Text>
                  </View>
                  </TouchableOpacity>
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
                      className={`w-full bg-white text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'}`}
                      style={styles.input}
                      placeholder="Recipient address"
                      placeholderTextColor="#9CA3AF"
                      value={formData.receiverAddress}
                      onChangeText={(text) => handleInputChange('receiverAddress', text)}
                      autoCapitalize="none"
                    />
                  </LinearGradient>
                  {errors.receiverAddress && (
                    <Text className="text-red-500 text-xs mt-1">{errors.receiverAddress}</Text>
                  )}
                </View>

                {errors.senderAddress && (
                  <Text className="text-red-500 text-xs mb-4">{errors.senderAddress}</Text>
                )}
                {error && <Text className="text-red-500 text-xs mb-4">{error.message}</Text>}

                <Button
                  title="Transfer"
                  onPress={handleTransfer}
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
        title="Confirm Transfer"
        message={`Are you sure you want to transfer ${formData.amount} ${selectedCoin} to ${formData.receiverAddress}?`}
        onConfirm={submitTransfer}
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