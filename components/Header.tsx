import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';

interface HeaderProps {
  title: string;
  onBackPress: () => void;
  isLandscape: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, onBackPress, isLandscape }) => {
  return (
    <View
      className={`w-full flex-row items-center justify-between ${
        isLandscape ? 'px-6 py-2' : 'px-4 pt-8 pb-4'
      }`}
    >
      <TouchableOpacity className={isLandscape ? 'p-1' : 'p-2'} onPress={onBackPress}>
        <Ionicons name="arrow-back" size={RFValue(24)} color="#000" />
      </TouchableOpacity>
      <Text
        className={`font-bold text-black flex-1 text-center ${
          isLandscape ? 'text-xl mr-8' : 'text-2xl mr-12'
        }`}
      >
        {title}
      </Text>
    </View>
  );
};

export default Header;