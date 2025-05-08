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
    <TouchableOpacity className='bg-purple-200'
      style={{
        borderRadius: 999,
        paddingVertical: isLandscape ? 6 : 10,
        paddingHorizontal: isLandscape ? 14 : 20,
        
        ...(width === 'full' ? { maxWidth: 448, width: '100%' } : { width: 'auto' }),
        
      }}
      onPress={onPress}
    >
      <Text
        style={{
          color: 'black',
          fontWeight: '500',
          fontSize: RFValue(isLandscape ? 12 : 14),
          textAlign: 'center',
          width: '100%',
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;