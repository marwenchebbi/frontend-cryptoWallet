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

const TransferScreen: React.FC = () => {
  const router = useRouter();
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();

  const [amount, setAmount] = useState('1000000');
  const [recipientAddress, setRecipientAddress] = useState('0X5572199002453327679');
  const [selectedCoin, setSelectedCoin] = useState('Proxym');

  const handleTransfer = () => {
    console.log('Transfer initiated:', { amount, recipientAddress, selectedCoin });
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
          {/* Header with back button */}
          <Header
            title=""
            onBackPress={handleBack}
            isLandscape={isLandscape}
          />

          {/* Available Balance Section */}
          <View className="items-center mt-6">
            <Text className="text-gray-500 text-sm">Available balance</Text>
            <Text className={`text-black font-bold ${isLandscape ? 'text-3xl' : 'text-4xl'}`}>
              6,500 PRX
            </Text>

            {/* Coin Selection Dropdown (Simplified) */}
            <TouchableOpacity
              className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mt-4"
              onPress={() => {
                console.log('Select coin');
                setSelectedCoin(selectedCoin === 'Proxym' ? 'USDT' : 'Proxym');
              }}
            >
              <View className="w-2 h-2 bg-black rounded-full mr-2" />
              <Text className="text-black text-base">{selectedCoin}</Text>
              <Ionicons name="swap-horizontal" size={RFValue(16)} color="#000" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>

          {/* Transfer Form Section with Gradient Border */}
          <View className="flex-1 items-center justify-center my-8">
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-3xl p-[2px] w-10/12 max-w-md"
              style={styles.gradient}
            >
              <View className="bg-white rounded-3xl p-6" style={styles.transferContainer}>
                <Text className={`text-black text-center font-semibold ${isLandscape ? 'text-lg' : 'text-xl'} mb-5`}>
                  Transfer
                </Text>

                {/* Amount Input with PRX Label */}
                <View className="flex-row items-center mb-4">
                  <View className="bg-black rounded-full px-4 py-2">
                    <Text className="text-white text-base">PRX</Text>
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
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="numeric"
                    />
                  </LinearGradient>
                </View>

                {/* Recipient Address Input */}
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
                      value={recipientAddress}
                      onChangeText={setRecipientAddress}
                      autoCapitalize="none"
                    />
                  </LinearGradient>
                </View>

                {/* Transfer Button */}
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