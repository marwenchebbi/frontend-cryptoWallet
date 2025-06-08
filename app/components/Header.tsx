import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import Octicons from '@expo/vector-icons/Octicons';
import { router } from 'expo-router';

interface HeaderProps {
  title?: string;
  onBackPress?: () => void;
  onHistoryPress?: () => void;
  isLandscape: boolean;
  backEnabled?: boolean,
  historyEnabled?: boolean,
  rewardEnbaled?:boolean
}

const Header: React.FC<HeaderProps> = ({ title, onBackPress, isLandscape,backEnabled , historyEnabled , onHistoryPress,rewardEnbaled}) => {
  return (
    <View
      className={`w-full h-15 flex-row items-center justify-between space-x-3 px-4 py-2`}
    >

      
      {backEnabled &&
      <TouchableOpacity className={isLandscape ? 'p-1' : 'p-2'} onPress={onBackPress}>
        <Ionicons name="arrow-back" size={RFValue(24)} color="#000" />
      </TouchableOpacity>}

           {rewardEnbaled &&
      <TouchableOpacity className={isLandscape ? 'p-1' : 'p-2'} onPress={()=>router.push('/screens/reward.screen')}>
          <Ionicons name="gift-outline" size={RFValue(24)} color="#000" />
      </TouchableOpacity>}


      {historyEnabled && <TouchableOpacity className={isLandscape ? 'p-1' : 'p-2'} onPress={onHistoryPress}  >
        <Octicons name="history" size={RFValue(24)} color="black" />
      </TouchableOpacity> }
    </View>
  );
};

export default Header;