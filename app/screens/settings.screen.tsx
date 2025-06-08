// screens/SettingsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Switch,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '@/app/components/Header';
import { Feather } from '@expo/vector-icons';
import { useWalletMutations } from '../hooks/wallet-info-hooks/lockandunlock.hooks';
import { use2FAMutations } from '../hooks/auth-hooks/update2FA.hooks';
import SuccessModal from '@/app/components/SuccessModal';
import { useBiometricAuth } from '../hooks/shared/useBiometricAuth';
import TrelloOAuthButton from '../utils/trelloButton';
import Button from '@/app/components/Button';

interface TrelloTokenData {
  token: string;
  expires?: string;
}

const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const router = useRouter();
  const { lockWallet, unlockWallet, isLocking, isUnlocking } = useWalletMutations();
  const { enable2FA, disable2FA, isEnabling2FA, isDisabling2FA } = use2FAMutations();
  const { authenticate, isBiometricSupported, isBiometricEnrolled } = useBiometricAuth();

  const [backEnabled, setBackEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [lockAppEnabled, setLockAppEnabled] = useState(false);
  const [lockAccountEnabled, setLockAccountEnabled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [attemptingUnlock, setAttemptingUnlock] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    isVisible: boolean;
    title: string;
    message: string;
  }>({ isVisible: false, title: '', message: '' });

  const [isTrelloConnected, setIsTrelloConnected] = useState(false);
  const [trelloConnectionStatus, setTrelloConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = await SecureStore.getItemAsync('userId');
        const storedWalletAddress = await SecureStore.getItemAsync('walletAddress');
        const twoFactor = await SecureStore.getItemAsync('TowFAEnabled');
        const lockApp = await SecureStore.getItemAsync('lockAppEnabled');
        const lockAccount = await SecureStore.getItemAsync('isWalletLocked');
        const trelloToken = await SecureStore.getItemAsync('trello_access_token');
        
        setUserId(storedUserId);
        setWalletAddress(storedWalletAddress);
        setTwoFactorEnabled(twoFactor === 'true');
        setLockAppEnabled(lockApp === 'true');
        setLockAccountEnabled(lockAccount === 'true');
        setIsTrelloConnected(!!trelloToken);
        setTrelloConnectionStatus(trelloToken ? 'connected' : 'disconnected');
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setIsLoading(false);
        Alert.alert('Error', 'Failed to load settings. Please try again.');
      }
    };

    fetchUserData();
  }, []);

  const showSuccessModal = (title: string, message: string) => {
    setSuccessModal({ isVisible: true, title, message });
  };

  const closeSuccessModal = () => {
    setSuccessModal({ isVisible: false, title: '', message: '' });
  };

  const handleTrelloSuccess = async (tokenData: TrelloTokenData) => {
    try {
      await SecureStore.setItemAsync('trello_access_token', tokenData.token);
      if (tokenData.expires) {
        await SecureStore.setItemAsync('trello_token_expires', tokenData.expires);
      }
      setIsTrelloConnected(true);
      setTrelloConnectionStatus('connected');
      showSuccessModal('Trello Connected', 'Successfully connected to Trello! You can now sync your boards, lists, and cards.');
    } catch (error) {
      console.error('Error storing Trello tokens:', error);
      Alert.alert('Error', 'Failed to save Trello connection. Please try again.');
    }
  };

  const handleTrelloError = (error: string) => {
    console.error('Trello OAuth Error:', error);
    setTrelloConnectionStatus('disconnected');
    Alert.alert('Connection Failed', `Failed to connect to Trello: ${error}`);
  };

  const handleDisconnectTrello = () => {
    Alert.alert(
      'Disconnect Trello',
      'Are you sure you want to disconnect from Trello? This will remove access to your boards, lists, and cards.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('trello_access_token');
              await SecureStore.deleteItemAsync('trello_token_expires');
              setIsTrelloConnected(false);
              setTrelloConnectionStatus('disconnected');
              showSuccessModal('Trello Disconnected', 'Successfully disconnected from Trello.');
            } catch (error) {
              console.error('Error disconnecting Trello:', error);
              Alert.alert('Error', 'Failed to disconnect from Trello. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handle2FAToggle = async (value: boolean) => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found');
      return;
    }

    try {
      const authSuccess = await authenticate();
      if (!authSuccess && (await SecureStore.getItemAsync('TowFAEnabled')) === 'true') {
        Alert.alert('Authentication Failed', 'Biometric verification is required to change 2FA settings.');
        return;
      }

      if (value) {
        await enable2FA({ userId });
        setTwoFactorEnabled(true);
        showSuccessModal('2FA Enabled', 'Two-factor authentication has been enabled successfully.');
      } else {
        await disable2FA({ userId });
        setTwoFactorEnabled(false);
        showSuccessModal('2FA Disabled', 'Two-factor authentication has been disabled successfully.');
      }
    } catch (error) {
      console.error('Error changing 2FA state:', error);
      Alert.alert('Error', 'Failed to update 2FA settings. Please try again.');
    }
  };

  const handleToggle = async (setting: string, value: boolean) => {
    try {
      switch (setting) {
        case 'twoFactor':
          await handle2FAToggle(value);
          break;
        case 'lockApp':
          const authSuccess = await authenticate();
          if (authSuccess || (await SecureStore.getItemAsync('TowFAEnabled')) !== 'true') {
            setLockAppEnabled(value);
            await SecureStore.setItemAsync('lockAppEnabled', value.toString());
            showSuccessModal(
              value ? 'App Locked' : 'App Unlocked',
              `App lock has been ${value ? 'enabled' : 'disabled'} successfully.`,
            );
          } else {
            Alert.alert('Authentication Failed', 'Biometric verification is required to change app lock settings.');
          }
          break;
        case 'lockAccount':
          if (!userId || !walletAddress) {
            Alert.alert('Error', 'User ID or wallet address not found');
            return;
          }
          if (value) {
            await lockWallet({ userId, walletAddress });
            setLockAccountEnabled(true);
            await SecureStore.setItemAsync('isWalletLocked', 'true');
            showSuccessModal('Account Locked', 'Your account has been locked successfully.');
          } else {
            setAttemptingUnlock(true);
            setShowPasswordModal(true);
          }
          break;
      }
    } catch (error) {
      console.error(`Error updating ${setting}:`, error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleUnlockWallet = async () => {
    if (!userId || !walletAddress || !password) {
      Alert.alert('Error', 'Please provide all required information');
      return;
    }

    try {
      await unlockWallet({ userId, walletAddress, password });
      setLockAccountEnabled(false);
      await SecureStore.setItemAsync('isWalletLocked', 'false');
      setShowPasswordModal(false);
      setPassword('');
      setAttemptingUnlock(false);
      showSuccessModal('Account Unlocked', 'Your account has been unlocked successfully.');
    } catch (error) {
      console.error('Error unlocking wallet:', error);
      Alert.alert('Error', 'Failed to unlock wallet. Please check your password and try again.');
    }
  };

  const navigateToActions = () => {
    router.push('/screens/action.screen');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Animated.View entering={FadeIn.duration(600)}>
          <ActivityIndicator size="large" color="#A855F7" />
        </Animated.View>
      </SafeAreaView>
    );
  }

  const renderBiometricAlert = () => {
    if (!isBiometricSupported || !isBiometricEnrolled) {
      return (
        <Animated.View entering={FadeInDown.duration(600).delay(200)} className="bg-yellow-50 px-4 py-3 mb-4 rounded-lg border border-yellow-200">
          <Text className="text-yellow-800 text-sm">
            {!isBiometricSupported
              ? "Your device doesn't support biometric authentication."
              : 'Please set up biometric authentication in your device settings.'}
          </Text>
        </Animated.View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View
        entering={FadeIn.duration(600)}
        className="absolute top-0 left-0 right-0 z-50 bg-white"
        style={{ paddingTop: insets.top }}
      >
        <Header
          title="Settings"
          onBackPress={handleBack}
          isLandscape={isLandscape}
          backEnabled={backEnabled}
          historyEnabled={false}
        />
      </Animated.View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeInDown.duration(600).delay(200)}
          className={`flex-1 items-center ${isLandscape ? 'px-6' : 'px-4'}`}
        >
          {renderBiometricAlert()}

          {/* Security Section */}
          <Animated.View entering={FadeInDown.duration(600).delay(300)} className="w-full max-w-md mb-6">
            <Text className="text-gray-600 text-sm mb-2 uppercase font-medium">Security</Text>
            <View className="bg-gray-50 rounded-xl overflow-hidden">
              <View className="flex-row justify-between items-center py-4 px-4 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                    <Feather name="lock" size={16} color="#374151" />
                  </View>
                  <View>
                    <Text className="text-black text-base">Two-Factor Verification</Text>
                    <Text className="text-gray-600 text-xs mt-1">Use biometrics to secure your account</Text>
                  </View>
                </View>
                <Switch
                  trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
                  thumbColor={twoFactorEnabled ? '#A855F7' : '#ffffff'}
                  ios_backgroundColor="#E5E7EB"
                  onValueChange={(value) => handleToggle('twoFactor', value)}
                  value={twoFactorEnabled}
                  disabled={isEnabling2FA || isDisabling2FA}
                />
              </View>
              <View className="flex-row justify-between items-center py-4 px-4 border-b border-gray-100">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                    <Feather name="smartphone" size={16} color="#374151" />
                  </View>
                  <View>
                    <Text className="text-black text-base">Lock App</Text>
                    <Text className="text-gray-600 text-xs mt-1">Require authentication at app start</Text>
                  </View>
                </View>
                <Switch
                  trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
                  thumbColor={lockAppEnabled ? '#A855F7' : '#ffffff'}
                  ios_backgroundColor="#E5E7EB"
                  onValueChange={(value) => handleToggle('lockApp', value)}
                  value={lockAppEnabled}
                  disabled={isLoading}
                />
              </View>
              <View className="flex-row justify-between items-center py-4 px-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center mr-3">
                    <Feather name="user-x" size={16} color="#374151" />
                  </View>
                  <View>
                    <Text className="text-black text-base">Lock Account</Text>
                    <Text className="text-gray-600 text-xs mt-1">Prevent transactions until unlocked</Text>
                  </View>
                </View>
                <Switch
                  trackColor={{ false: '#E5E7EB', true: '#C4B5FD' }}
                  thumbColor={lockAccountEnabled ? '#A855F7' : '#ffffff'}
                  ios_backgroundColor="#E5E7EB"
                  onValueChange={(value) => handleToggle('lockAccount', value)}
                  value={lockAccountEnabled}
                  disabled={isLocking || isUnlocking || attemptingUnlock}
                />
              </View>
            </View>
          </Animated.View>

          {/* Integrations Section */}
          <Animated.View entering={FadeInDown.duration(600).delay(400)} className="w-full max-w-md mb-6">
            <Text className="text-gray-600 text-sm mb-2 uppercase font-medium">Integrations</Text>
            <View className="bg-gray-50 rounded-xl overflow-hidden">
              <View className="py-4 px-4">
                <View className="flex-row items-center mb-4">
                  <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Feather name="trello" size={16} color="#374151" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-black text-base">Trello</Text>
                    <Text className="text-gray-600 text-xs mt-1">
                      {isTrelloConnected ? 'Connected - Sync boards, lists, and cards' : 'Connect to sync your boards, lists, and cards'}
                    </Text>
                  </View>
                  {isTrelloConnected && (
                    <View className="bg-green-100 px-2 py-1 rounded-full">
                      <Text className="text-green-800 text-xs font-medium">Connected</Text>
                    </View>
                  )}
                </View>
                {isTrelloConnected ? (
                  <Animated.View entering={FadeInDown.duration(600).delay(500)} className="w-full">
                    <Button
                      title="Disconnect from Trello"
                      onPress={handleDisconnectTrello}
                      isLandscape={isLandscape}
                      className="bg-[#f46f6f59]"
                    />
                  </Animated.View>
                ) : (
                  <Animated.View entering={FadeInDown.duration(600).delay(500)} className="w-full">

                      <TrelloOAuthButton
                        onSuccess={handleTrelloSuccess}
                        onError={handleTrelloError}
                        loadingColor="#A855F7"
                        scope="read,write"
                        expiration="30days"
                      />
                  </Animated.View>
                )}
              </View>
            </View>
          </Animated.View>

          {/* Activity Section */}
          <Animated.View entering={FadeInDown.duration(600).delay(600)} className="w-full max-w-md mb-6">
            <Text className="text-gray-600 text-sm mb-2 uppercase font-semibold">Activity</Text>
            <View className="bg-gray-50 rounded-lg overflow-hidden">
              <Button
                title="View Action Log"
                onPress={navigateToActions}
                isLandscape={isLandscape}
                className="flex-row justify-between items-center py-4 px-4"
            
              />
            </View>
          </Animated.View>

          <LinearGradient
            colors={['#A855F7', '#F472B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              height: 2,
              marginVertical: 20,
              borderRadius: 2,
              opacity: 0.7,
            }}
          />

          <Animated.View entering={FadeInDown.duration(600).delay(700)} className="items-center mt-6">
            <Text className="text-gray-600 text-sm">Version 1.0.0</Text>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Password Prompt Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showPasswordModal}
        onRequestClose={() => {
          setShowPasswordModal(false);
          setPassword('');
          setAttemptingUnlock(false);
        }}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <Animated.View entering={FadeInDown.duration(600)} className="bg-white rounded-2xl p-6 w-4/5 max-w-md">
            <Text className="text-lg font-semibold text-black mb-4">Enter Password</Text>
            <Text className="text-gray-600 text-sm mb-4">
              Enter your password to unlock your account.
            </Text>
            <LinearGradient
              colors={['#A855F7', '#F472B6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-full p-[2px] mb-4"
            >
              <TextInput
                className="bg-white text-black rounded-full py-3 px-4"
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </LinearGradient>
            <View className="flex-row justify-end space-x-4">
              <Button
                title="Cancel"
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setAttemptingUnlock(false);
                }}
                isLandscape={isLandscape}
                className="bg-gray-100"

              />
              <Button
                title={isUnlocking ? 'Unlocking...' : 'Unlock'}
                onPress={handleUnlockWallet}
                isLandscape={isLandscape}
                className={isUnlocking || !password ? 'text-gray-400' : 'text-black'}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>

      <SuccessModal
        isVisible={successModal.isVisible}
        onClose={closeSuccessModal}
        title={successModal.title}
        message={successModal.message}
      />

      <StatusBar style="dark" translucent={false} backgroundColor="white" />
    </SafeAreaView>
  );
};

export default SettingsScreen;