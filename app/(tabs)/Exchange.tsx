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
  Alert,
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
import * as Haptics from 'expo-haptics';

const Exchange: React.FC = () => {
  const router = useRouter();
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();

  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [prxAmount, setPrxAmount] = useState('');
  const [usdtAmount, setUsdtAmount] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('Proxym');
  const [errorMessage, setErrorMessage] = useState('');

  const availablePrxBalance = 6500; // Available PRX balance
  const availableUsdtBalance = 1000; // Available USDT balance (for demo purposes)
  const exchangeRate = 0.021; // 1 PRX = 0.021 USDT

  // Calculate USDT amount based on PRX input (for Sell)
  const handlePrxChange = (value: string) => {
    setPrxAmount(value);
    const prx = parseFloat(value) || 0;
    setUsdtAmount((prx * exchangeRate).toFixed(2));

    // Validate PRX balance
    if (prx > availablePrxBalance) {
      setErrorMessage('Insufficient PRX balance');
    } else {
      setErrorMessage('');
    }
  };

  // Calculate PRX amount based on USDT input (for Buy)
  const handleUsdtChange = (value: string) => {
    setUsdtAmount(value);
    const usdt = parseFloat(value) || 0;
    setPrxAmount((usdt / exchangeRate).toFixed(2));

    // Validate USDT balance
    if (usdt > availableUsdtBalance) {
      setErrorMessage('Insufficient USDT balance');
    } else {
      setErrorMessage('');
    }
  };

  // Set max amount based on available balance
  const handleMaxAmount = () => {
    if (tradeType === 'buy') {
      handleUsdtChange(availableUsdtBalance.toString());
    } else {
      handlePrxChange(availablePrxBalance.toString());
    }
  };

  // Handle trade with confirmation
  const handleTrade = () => {
    if (errorMessage) {
      Alert.alert('Error', errorMessage);
      return;
    }

    if (!prxAmount || !usdtAmount) {
      Alert.alert('Error', 'Please enter an amount to trade.');
      return;
    }

    Alert.alert(
      'Confirm Trade',
      `Are you sure you want to ${tradeType} ${prxAmount} PRX for ${usdtAmount} USDT?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            console.log('Trade initiated:', { tradeType, prxAmount, usdtAmount, selectedCoin });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Success', 'Trade completed successfully!');
            setPrxAmount('');
            setUsdtAmount('');
          },
        },
      ]
    );
  };

  // Calculate new balance after trade
  const newPrxBalance =
    tradeType === 'buy'
      ? availablePrxBalance + (parseFloat(prxAmount) || 0)
      : availablePrxBalance - (parseFloat(prxAmount) || 0);

  const newUsdtBalance =
    tradeType === 'sell'
      ? availableUsdtBalance + (parseFloat(usdtAmount) || 0)
      : availableUsdtBalance - (parseFloat(usdtAmount) || 0);

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
          <Header title="" onBackPress={handleBack} isLandscape={isLandscape} />

          {/* Available Balance Section */}
          <View className="items-center mt-6">
            <Text className="text-gray-500 text-sm">Available balance</Text>
            <Text className={`text-black font-bold ${isLandscape ? 'text-3xl' : 'text-4xl'}`}>
              {availablePrxBalance.toLocaleString()} PRX
            </Text>

            {/* Coin Selection Dropdown */}
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

          {/* Exchange Form Section with Gradient Border */}
          <View className="flex-1 items-center justify-center my-10">
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-3xl p-[2px] w-10/12 max-w-md"
              style={styles.gradient}
            >
              <View className="bg-white rounded-3xl p-6" style={styles.exchangeContainer}>
                {/* Buy/Sell Toggle with Color Indicators */}
                <View className="flex-row bg-gray-200 rounded-full p-1 mb-6">
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full flex-row justify-center items-center ${
                      tradeType === 'buy' ? 'bg-black' : ''
                    }`}
                    onPress={() => {
                      setTradeType('buy');
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Ionicons
                      name="arrow-down"
                      size={RFValue(16)}
                      color={tradeType === 'buy' ? '#fff' : '#000'}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      className={`text-center font-semibold ${tradeType === 'buy' ? 'text-white' : 'text-black'}`}
                    >
                      Buy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 py-2 rounded-full flex-row justify-center items-center ${
                      tradeType === 'sell' ? 'bg-black' : ''
                    }`}
                    onPress={() => {
                      setTradeType('sell');
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={RFValue(16)}
                      color={tradeType === 'sell' ? '#fff' : '#000'}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      className={`text-center font-semibold ${tradeType === 'sell' ? 'text-white' : 'text-black'}`}
                    >
                      Sell
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Exchange Rate */}
                <Text className="text-center text-pink-500 text-sm mb-6">
                  1 PRX = 0.021 USDT <Ionicons name="swap-horizontal" size={RFValue(12)} color="#EC4899" />
                </Text>

                {/* Error Message */}
                {errorMessage ? (
                  <Text className="text-red-500 text-center mb-4">{errorMessage}</Text>
                ) : null}

                {/* PRX Input Section (only for Sell) */}
                {tradeType === 'sell' && (
                  <View className="flex-row items-center mb-6">
                    <View className="bg-black rounded-full px-4 py-2">
                      <Text className="text-white text-base">PRX</Text>
                    </View>
                    <View className="flex-1 ml-2">
                      <LinearGradient
                        colors={['#A855F7', '#F472B6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="rounded-full p-[2px]"
                        style={styles.gradient}
                      >
                        <View className="flex-row items-center bg-white rounded-full">
                          <TextInput
                            className={`flex-1 bg-white text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'}`}
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor="#9CA3AF"
                            value={prxAmount}
                            onChangeText={handlePrxChange}
                            keyboardType="numeric"
                          />
                          <TouchableOpacity
                            className="bg-gray-200 rounded-full px-3 py-1 mr-2"
                            onPress={handleMaxAmount}
                          >
                            <Text className="text-black text-sm">Max</Text>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </View>
                  </View>
                )}

                {/* USDT Input Section (only for Buy) */}
                {tradeType === 'buy' && (
                  <View className="flex-row items-center mb-6">
                    <View className="bg-black rounded-full px-4 py-2">
                      <Text className="text-white text-base">USDT</Text>
                    </View>
                    <View className="flex-1 ml-2">
                      <LinearGradient
                        colors={['#A855F7', '#F472B6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="rounded-full p-[2px]"
                        style={styles.gradient}
                      >
                        <View className="flex-row items-center bg-white rounded-full">
                          <TextInput
                            className={`flex-1 bg-white text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'}`}
                            style={styles.input}
                            placeholder="0"
                            placeholderTextColor="#9CA3AF"
                            value={usdtAmount}
                            onChangeText={handleUsdtChange}
                            keyboardType="numeric"
                          />
                          <TouchableOpacity
                            className="bg-gray-200 rounded-full px-3 py-1 mr-2"
                            onPress={handleMaxAmount}
                          >
                            <Text className="text-black text-sm">Max</Text>
                          </TouchableOpacity>
                        </View>
                      </LinearGradient>
                    </View>
                  </View>
                )}

                {/* Trade Button */}
                <Button
                  title="Trade"
                  onPress={handleTrade}
                  isLandscape={isLandscape}
                  width="full"

                />

                {/* Result Section (PRX/USDT will be added) */}
                <View className="bg-gray-100 rounded-lg p-4">
                  {tradeType === 'buy' ? (
                    <View>
                      <Text className="text-black text-base font-semibold">
                        <Ionicons name="wallet" size={RFValue(16)} color="#000" />{' '}
                        {prxAmount || '0'} PRX will be added
                      </Text>
                    </View>
                  ) : (
                    <View>
                      <Text className="text-black text-base font-semibold">
                        <Ionicons className='mt-2' name="wallet" size={RFValue(16)} color="#000" />{' '}
                        {usdtAmount || '0'} USDT will be added
                      </Text>
                    </View>
                  )}
                </View>
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