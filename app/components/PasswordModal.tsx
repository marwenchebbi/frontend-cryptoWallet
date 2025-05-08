import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

interface PasswordModalProps {
  isVisible: boolean;
  onConfirm: (password: string) => void;
  onCancel: () => void;
  isLoading: boolean;
  error?: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isVisible,
  onConfirm,
  onCancel,
  isLoading,
  error,
}) => {
  const [password, setPassword] = useState<string>('');

  const handleConfirm = () => {
    onConfirm(password);
    setPassword(''); // Clear password after confirm
  };

  const handleCancel = () => {
    onCancel();
    setPassword(''); // Clear password on cancel
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <Animated.View
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        className="flex-1 justify-center items-center bg-black/50"
      >
        <View className="bg-white rounded-2xl p-6 w-11/12 max-w-md">
          <Text className="text-lg font-semibold text-black mb-4">
            Enter Wallet Password
          </Text>

          <View className="flex-row items-center bg-gray-100 rounded-lg p-3 mb-4">
            <Feather name="lock" size={20} color="#A855F7" className="mr-2" />
            <TextInput
              className="flex-1 text-black"
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
          </View>

          {error && (
            <Text className="text-red-500 text-sm mb-4 text-center">{error}</Text>
          )}

          <View className="flex-row justify-between">
            <TouchableOpacity
              className="bg-gray-200 rounded-lg px-4 py-2 flex-1 mr-2"
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text className="text-black text-center">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-purple-500 rounded-lg px-4 py-2 flex-1 ml-2"
              onPress={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-center">Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default PasswordModal;