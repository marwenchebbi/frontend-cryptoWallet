import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RFValue } from 'react-native-responsive-fontsize';
import QRCode from 'react-native-qrcode-svg';
import * as SecureStore from 'expo-secure-store';

// Custom hooks
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useGetUserInfo } from '../hooks/auth-hooks/user-info.hooks';
import { useLogout } from '../hooks/auth-hooks/logout.hooks';
import { useUpdateProfile } from '../hooks/auth-hooks/update-profile.hooks';
import { useChangePassword } from '../hooks/auth-hooks/change-password.hooks';

// Components
import Header from '@/app/components/Header';
import Button from '@/app/components/Button';
import SuccessModal from '../components/SuccessModal';
import { UserFormData } from '../models/user';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const insets = useSafeAreaInsets();

  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('Success');

  // Form state for editable user info
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<UserFormData & { oldPassword: string; newPassword: string; general: string }>
  >({});

  // Fetch user info
  const {
    data: userInfo,
    isLoading: isUserLoading,
    error: userError,
    refetch: userRefetch,
  } = useGetUserInfo();

  // Logout mutation
  const { mutate: logoutMutate, isPending: isLogoutPending } = useLogout();

  // Update profile mutation
  const { mutate: updateProfileMutate, isPending: isUpdatePending } = useUpdateProfile();

  // Change password mutation
  const { mutate: changePasswordMutate, isPending: isChangePasswordPending } = useChangePassword();

  /* Handle token expiration
  useEffect(() => {
    if (userError?.message === 'TOKEN_EXPIRED') {
      SecureStore.deleteItemAsync('accessToken');
      router.replace('/screens/login.screen');
    }
  }, [userError, router]);*/

  // Initialize form data and ensure QR code updates
  useEffect(() => {
    if (userInfo) {
      setFormData({
        name: userInfo.name,
        email: userInfo.email,
      });
    }
  }, [userInfo]);

  // Handle input changes for profile
  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setErrors((prev) => ({ ...prev, general: undefined }));
  };

  // Handle input changes for passwords
  const handlePasswordChange = (field: 'oldPassword' | 'newPassword', value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    setErrors((prev) => ({ ...prev, general: undefined }));
  };

  // Handle save profile
  const handleSaveProfile = () => {
    updateProfileMutate(formData, {
      onSuccess: () => {
        setIsEditingName(false);
        setIsSuccessModalVisible(true);
        setSuccessMessage('Name changed successfully! 😎');
      },
      onError: (error: { message: string }) => {
        try {
          const validationErrors = JSON.parse(error.message);
          setErrors(validationErrors);
        } catch {
          setErrors({ general: error.message || 'Failed to update profile' });
        }
      },
    });
  };

  // Handle change password
  const handleChangePassword = () => {
    changePasswordMutate(passwordData, {
      onSuccess: () => {
        setIsEditingPassword(false);
        setPasswordData({ oldPassword: '', newPassword: '' });
        setIsSuccessModalVisible(true);
        setSuccessMessage('Password changed successfully! 😎');
      },
      onError: (error: { message: string }) => {
        try {
          const validationErrors = JSON.parse(error.message);
          setErrors(validationErrors);
        } catch {
          setErrors({ general: error.message || 'Failed to change password' });
        }
      },
    });
  };

  // Handle logout
  const handleLogout = () => {
    logoutMutate(undefined, {
      onSuccess: () => {
        setIsSuccessModalVisible(true);
        setSuccessMessage('Déconnexion Réussie! 😎');
      },
      onError: (error) => {
        setErrors({ general: error.message || 'Failed to log out' });
      },
    });
  };

  // Handle settings navigation
  const handleSettings = () => {
    router.push('/screens/settings.screen');
  };

  // Refresh data
  const updateData = () => {
    userRefetch();
    setIsEditingName(false);
    setIsEditingPassword(false);
    setErrors({});
    setPasswordData({ oldPassword: '', newPassword: '' });
    if (userInfo) {
      setFormData({
        name: userInfo.name,
        email: userInfo.email,
      });
    }
  };

  // Loading state
  if (isUserLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Animated.View entering={FadeIn.duration(600)}>
          <Text className="text-gray-600 text-lg">Loading profile...</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Error state
  if (userError) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Animated.View entering={FadeIn.duration(600)}>
          <Text className="text-red-500 text-lg">
            {userError.message === 'TOKEN_EXPIRED'
              ? 'Session expired. Redirecting to login...'
              : `Error: ${userError.message}`}
          </Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  // Estimate tab bar height
  const tabBarHeight = 50 + insets.bottom;

  // Estimate header height
  const headerHeight = isLandscape ? 40 : 60;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Fixed Header */}
      <Animated.View
        entering={FadeIn.duration(600)}
        className="absolute top-0 left-0 right-0 z-50 bg-white"
        style={{
          paddingTop: insets.top,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          shadowColor: '#fff',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 1,
        }}
      >
        <Header
          title="Profile"
          onBackPress={handleBack}
          isLandscape={isLandscape}
          backEnabled={false}
          historyEnabled={false}
        />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? tabBarHeight + headerHeight : 20 + tabBarHeight
        }
      >
        <Animated.ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: headerHeight + insets.top,
            paddingBottom: tabBarHeight + 40,
          }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={isUserLoading} onRefresh={updateData} />}
        >
          {/* QR Code Section */}
          <Animated.View entering={FadeInDown.duration(600).delay(200)} className="items-center mt-6">
            {userInfo?.walletAddress && /^0x[a-fA-F0-9]{40}$/.test(userInfo.walletAddress) ? (
              <Animated.View
                entering={FadeIn.duration(600).delay(300)}
                className="w-40 h-40 rounded-lg overflow-hidden bg-white p-2"
              >
                <QRCode
                  value={userInfo.walletAddress}
                  size={120}
                  color="black"
                  backgroundColor="white"
                />
              </Animated.View>
            ) : (
              <Animated.Text
                entering={FadeIn.duration(600).delay(300)}
                className="text-gray-500 text-sm"
              >
                No valid wallet address available
              </Animated.Text>
            )}
            <Animated.Text
              entering={FadeInDown.duration(600).delay(400)}
              className="text-gray-600 text-xs mt-2"
            >
              Your wallet QR code
            </Animated.Text>
          </Animated.View>

          {/* Profile Form */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(500)}
            className="flex-1 items-center mt-8 px-4"
          >
            {/* Name Field */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(600)}
              className={`w-full max-w-md ${isLandscape ? 'mb-2' : 'mb-6'}`}
            >
              <Text className="text-gray-600 text-sm mb-2">Name</Text>
              <LinearGradient
                colors={['#A855F7', '#F472B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-full p-[2px]"
                style={{ overflow: 'hidden' }}
              >
                <View className="flex-row items-center bg-white rounded-full">
                  <TextInput
                    className={`flex-1 text-black ${
                      isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                    }`}
                    placeholder="Name"
                    placeholderTextColor="#9CA3AF"
                    value={formData.name}
                    onChangeText={(text) => handleInputChange('name', text)}
                    editable={isEditingName}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (isEditingName) {
                        handleSaveProfile();
                      } else {
                        setIsEditingName(true);
                      }
                    }}
                    disabled={isUpdatePending}
                    className="p-3"
                  >
                    <MaterialIcons
                      name={isEditingName ? 'save' : 'edit'}
                      size={RFValue(isLandscape ? 20 : 24)}
                      color={isUpdatePending ? '#A0A0A0' : '#374151'}
                    />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
              {errors.name && (
                <Animated.Text
                  entering={FadeIn.duration(600).delay(700)}
                  className="text-red-500 text-xs mt-1 text-center"
                >
                  {errors.name}
                </Animated.Text>
              )}
            </Animated.View>

            {/* Email Field */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(800)}
              className={`w-full max-w-md ${isLandscape ? 'mb-2' : 'mb-6'}`}
            >
              <Text className="text-gray-600 text-sm mb-2">Email</Text>
              <LinearGradient
                colors={['#A855F7', '#F472B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-full p-[2px]"
                style={{ overflow: 'hidden' }}
              >
                <View className="flex-row items-center bg-white rounded-full">
                  <TextInput
                    className={`flex-1 text-black ${
                      isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                    }`}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    editable={false}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </LinearGradient>
              {errors.email && (
                <Animated.Text
                  entering={FadeIn.duration(600).delay(900)}
                  className="text-red-500 text-xs mt-1 text-center"
                >
                  {errors.email}
                </Animated.Text>
              )}
            </Animated.View>

            {/* Password Change Section */}
            {isEditingPassword && (
              <>
                {/* Old Password Field */}
                <Animated.View
                  entering={FadeInDown.duration(600).delay(1000)}
                  className={`w-full max-w-md ${isLandscape ? 'mb-2' : 'mb-6'}`}
                >
                  <Text className="text-gray-600 text-sm mb-2">Old Password</Text>
                  <LinearGradient
                    colors={['#A855F7', '#F472B6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-full p-[2px]"
                    style={{ overflow: 'hidden' }}
                  >
                    <View className="flex-row items-center bg-white rounded-full">
                      <TextInput
                        className={`flex-1 text-black ${
                          isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                        }`}
                        placeholder="Old Password"
                        placeholderTextColor="#9CA3AF"
                        value={passwordData.oldPassword}
                        onChangeText={(text) => handlePasswordChange('oldPassword', text)}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                    </View>
                  </LinearGradient>
                  {errors.oldPassword && (
                    <Animated.Text
                      entering={FadeIn.duration(600).delay(1100)}
                      className="text-red-500 text-xs mt-1 text-center"
                    >
                      {errors.oldPassword}
                    </Animated.Text>
                  )}
                </Animated.View>

                {/* New Password Field */}
                <Animated.View
                  entering={FadeInDown.duration(600).delay(1200)}
                  className={`w-full max-w-md ${isLandscape ? 'mb-2' : 'mb-6'}`}
                >
                  <Text className="text  -gray-600 text-sm mb-2">New Password</Text>
                  <LinearGradient
                    colors={['#A855F7', '#F472B6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-full p-[2px]"
                    style={{ overflow: 'hidden' }}
                  >
                    <View className="flex-row items-center bg-white rounded-full">
                      <TextInput
                        className={`flex-1 text-black ${
                          isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                        }`}
                        placeholder="New Password"
                        placeholderTextColor="#9CA3AF"
                        value={passwordData.newPassword}
                        onChangeText={(text) => handlePasswordChange('newPassword', text)}
                        secureTextEntry
                        autoCapitalize="none"
                      />
                    </View>
                  </LinearGradient>
                  {errors.newPassword && (
                    <Animated.Text
                      entering={FadeIn.duration(600).delay(1300)}
                      className="text-red-500 text-xs mt-1 text-center"
                    >
                      {errors.newPassword}
                    </Animated.Text>
                  )}
                </Animated.View>
              </>
            )}

            {/* Change Password Button */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(1400)}
              className="w-full max-w-md mt-4 items-center"
            >
              <Button
                title={isEditingPassword ? 'Save Password' : 'Change Password'}
                onPress={() => {
                  if (isEditingPassword) {
                    handleChangePassword();
                  } else {
                    setIsEditingPassword(true);
                  }
                }}
                isLandscape={isLandscape}
              />
            </Animated.View>

            {/* Settings Button */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(1500)}
              className="w-full max-w-md mt-4 items-center"
            >
              <Button title="Settings" onPress={handleSettings} isLandscape={isLandscape} />
            </Animated.View>

            {/* Logout Button */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(1600)}
              className="w-full max-w-md mt-4 items-center"
            >
              <Button
                className='bg-[#f46f6f59]'
                title="Log Out"
                onPress={handleLogout}
                isLandscape={isLandscape}

              />
            </Animated.View>

            {/* General Error */}
            {errors.general && (
              <Animated.Text
                entering={FadeIn.duration(600).delay(1700)}
                className="text-red-500 text-xs mt-4 text-center"
                >
                {errors.general}
              </Animated.Text>
            )}
          </Animated.View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        isVisible={isSuccessModalVisible}
        title="Success!"
        message={successMessage}
        onClose={() => {
          setIsSuccessModalVisible(false);
          if (successMessage === 'Déconnexion Réussie! 😎') {
            router.replace('/screens/login.screen');
          }
        }}
        duration={2000}
      />

      <StatusBar style="dark" translucent={false} backgroundColor="white" />
    </SafeAreaView>
  );
};

export default ProfileScreen;