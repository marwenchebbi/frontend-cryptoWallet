import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { RFValue } from 'react-native-responsive-fontsize';

// Custom hooks
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useGetUserInfo } from '../hooks/auth-hooks/user-info.hooks';
import { useLogout } from '../hooks/auth-hooks/logout.hooks';
import { useUpdateProfile } from '../hooks/auth-hooks/update-profile.hooks';
import { useChangePassword } from '../hooks/auth-hooks/change-password.hooks';
import { UserFormData } from '../models/types';

// Components
import Header from '@/components/Header';
import Button from '@/components/Button';

const ProfileScreen: React.FC = () => {
  const router = useRouter();
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const insets = useSafeAreaInsets();

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
 // const [isEditingEmail, setIsEditingEmail] = useState(false);
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

  // Initialize form data when user info loads
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
        Alert.alert('Success', 'Profile updated successfully');
        userRefetch();
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
        Alert.alert('Success', 'Password changed successfully. Please log in again.');
        router.replace('/screens/login.screen');
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
        router.replace('/screens/login.screen');
        Alert.alert('Success', 'You have been logged out');
      },
      onError: (error) => {
        Alert.alert('Error', error.message || 'Failed to log out');
      },
    });
  };

  // Handle settings navigation
  const handleSettings = () => {
    router.push('/Home');
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
        <Text className="text-gray-600 text-lg">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  // Error state
  if (userError) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <Text className="text-red-500 text-lg">Error: {userError.message}</Text>
      </SafeAreaView>
    );
  }

  // Estimate tab bar height
  const tabBarHeight = 50 + insets.bottom;

  // Estimate header height (adjust based on your Header component's actual height)
  const headerHeight = isLandscape ? 60 : 80; // You may need to adjust this value

  return (
    <SafeAreaView className="flex-1  bg-white">
      {/* Fixed Header */}
      <View
        className="absolute top-0 left-0 right-0 z-50 bg-transparent"
        style={{ paddingTop: insets.top }}
      >
        <Header title="Profile" onBackPress={handleBack} isLandscape={isLandscape} backEnabled={false} historyEnabled={false} />
      </View>

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
            paddingTop: headerHeight + insets.top, // Prevent content from being hidden under header
            paddingBottom: tabBarHeight + 40,
          }}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={isUserLoading} onRefresh={updateData} tintColor={'red'}/>}
        >
          {/* QR Code Section */}
          <View className="items-center mt-6">
            {userInfo?.walletAddress ? (
              <Animated.Image
                entering={FadeIn}
                exiting={FadeOut}
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${userInfo.walletAddress}`,
                }}
                className="w-40 h-40 rounded-lg"
              />
            ) : (
              <Text className="text-gray-500 text-sm">No wallet address available</Text>
            )}
            <Text className="text-gray-600 text-xs mt-2">Your wallet QR code</Text>
          </View>

          {/* Profile Form */}
          <View className="flex-1 items-center mt-8 px-4">
            {/* Name Field */}
            <View className={`w-full max-w-md ${isLandscape ? 'mb-2' : 'mb-6'}`}>
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
                    className={`flex-1 text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'}`}
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
                <Text className="text-red-500 text-xs mt-1 text-center">{errors.name}</Text>
              )}
            </View>

            {/* Email Field */}
            <View className={`w-full max-w-md ${isLandscape ? 'mb-2' : 'mb-6'}`}>
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
                    className={`flex-1 text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'}`}
                    placeholder="Email"
                    placeholderTextColor="#9CA3AF"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    editable= {false}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                </View>
              </LinearGradient>
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1 text-center">{errors.email}</Text>
              )}
            </View>

            {/* Password Change Section */}
            {isEditingPassword && (
              <>
                {/* Old Password Field */}
                <View className={`w-full max-w-md ${isLandscape ? 'mb-2' : 'mb-6'}`}>
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
                        className={`flex-1 text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'}`}
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
                    <Text className="text-red-500 text-xs mt-1 text-center">{errors.oldPassword}</Text>
                  )}
                </View>

                {/* New Password Field */}
                <View className={`w-full max-w-md ${isLandscape ? 'mb-2' : 'mb-6'}`}>
                  <Text className="text-gray-600 text-sm mb-2">New Password</Text>
                  <LinearGradient
                    colors={['#A855F7', '#F472B6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-full p-[2px]"
                    style={{ overflow: 'hidden' }}
                  >
                    <View className="flex-row items-center bg-white rounded-full">
                      <TextInput
                        className={`flex-1 text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'}`}
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
                    <Text className="text-red-500 text-xs mt-1 text-center">{errors.newPassword}</Text>
                  )}
                </View>
              </>
            )}

            {/* Change Password Button */}
            <View className="w-full max-w-md mt-4 items-center">
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
            </View>

            {/* General Error */}
            {errors.general && (
              <Text className="text-red-500 text-xs mt-4 text-center">{errors.general}</Text>
            )}

            {/* Settings Button */}
            <View className="w-full max-w-md mt-4 items-center">
              <Button
                title="Settings"
                onPress={handleSettings}
                isLandscape={isLandscape}
              />
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              disabled={isLogoutPending}
              className="mt-auto py-4"
            >
              <Text
                className={`text-gray-600 underline text-center ${
                  isLogoutPending ? 'text-gray-400' : 'text-gray-600'
                } ${isLandscape ? 'text-sm' : 'text-base'}`}
              >
                {isLogoutPending ? 'Logging out...' : 'Log Out'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <StatusBar style="dark" translucent={false} />
    </SafeAreaView>
  );
};

export default ProfileScreen;