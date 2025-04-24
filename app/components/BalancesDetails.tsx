import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface BalanceDetailsProps {
  walletInfo: { prxBalance: number; usdtBalance: number } | undefined;
  selectedBalance: 'Proxym' | 'USDT';
  onToggleBalance: () => void;
  isLandscape: boolean;
  price: number;
}

const BalanceDetails: React.FC<BalanceDetailsProps> = ({
  walletInfo,
  selectedBalance,
  onToggleBalance,
  isLandscape,
  price,
}) => {
  return (
    <Animated.View entering={FadeInDown.duration(600).delay(200)} className="items-center mt-6">
      <Animated.Text
        entering={FadeInDown.duration(600).delay(300)}
        className="text-gray-500 text-sm mb-2"
      >
        Available balance
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.duration(600).delay(400)}
        className={`text-black font-bold ${isLandscape ? 'text-3xl' : 'text-4xl'}`}
      >
        {selectedBalance === 'Proxym'
          ? `${walletInfo?.prxBalance.toFixed(3) || '0'} PRX`
          : `${walletInfo?.usdtBalance.toFixed(3) || '0'} USDT`}
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.duration(600).delay(500)}
        className={`text-gray-500 ${isLandscape ? 'text-m' : 'text-l'}`}
      >
        {selectedBalance === 'Proxym'
          ? `≈ ${((walletInfo?.prxBalance ?? 0) * price).toFixed(2)} USDT`
          : `≈ ${((walletInfo?.usdtBalance ?? 0) / price).toFixed(2) || '0'} PRX`}
      </Animated.Text>
      <Animated.View entering={FadeInDown.duration(600).delay(600)}>
        <TouchableOpacity
          className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 mt-4"
          onPress={onToggleBalance}
        >
          <View className="w-2 h-2 bg-black rounded-full mr-2" />
          <Text className="text-black text-base">{selectedBalance}</Text>
          <Ionicons
            name="swap-horizontal"
            size={RFValue(12)}
            color="#000"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

export default BalanceDetails;