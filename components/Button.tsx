import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

interface ButtonProps {
  title: string;
  onPress: () => void;
  width?: 'full' | 'auto';
  isLandscape: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  width = 'full', 
  isLandscape 
}) => {
  return (
    <TouchableOpacity
      className={`bg-purple-200 rounded-full ${
        width === 'full' ? 'max-w-md w-full' : 'w-auto'
      } ${isLandscape ? 'py-2' : 'py-3'} m-3`}
      onPress={onPress}
    >
      <Text
        className={`text-black font-medium w-full text-center ${
          isLandscape ? 'text-sm' : 'text-base'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;