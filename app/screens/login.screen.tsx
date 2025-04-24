// screens/login.screen.tsx
import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RFValue } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useLogin } from '../hooks/auth-hooks/login.hooks';
import Header from '@/app/components/Header';
import * as SecureStore from 'expo-secure-store';
import { validateForm } from '../validators/helpers';
import { loginSchema } from '../validators/auth.validator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import Button from '@/app/components/Button';
import { useBiometricAuth } from '../hooks/shared/useBiometricAuth';
import { LoginData } from '../models/auth';
import SuccessModal from '../components/SuccessModal';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginData>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const { mutate, isPending, error } = useLogin();
  const { isBiometricSupported, authenticate, error: biometricError } = useBiometricAuth();
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const submitLogin = () => {
    mutate(formData, {
      onSuccess: async (data: any) => {
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        await SecureStore.setItemAsync('userId', data.userId.toString());
        await SecureStore.setItemAsync('walletAddress', data.walletAddress.toString());
        setIsSuccessModalVisible(true); // Show success modal
      },
      onError: (err: any) => {
        setErrors({ email: err.message || 'Invalid credentials' });
      },
    });
  };

  const handleLogin = async () => {
    const { errors, success } = await validateForm(formData, loginSchema);
    if (!success) {
      setErrors(errors);
      return;
    }

    if (isBiometricSupported) {
      const isAuthenticated = await authenticate();
      if (!isAuthenticated) {
        setErrors({ email: biometricError || 'Biometric verification failed' });
        return;
      }
    }

    submitLogin();
  };

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors({});
  };

  const handleInputFocus = (field: 'email' | 'password', yPosition: number) => {
    setFocusedInput(field);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yPosition, animated: true });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View
        className="absolute top-0 left-0 right-0 z-40 bg-transparent"
        style={{ paddingTop: insets.top }}
      >
        <Header
          title="Login"
          onBackPress={handleBack}
          isLandscape={isLandscape}
          backEnabled={true}
          historyEnabled={false}
        />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 5}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className={`flex-1 justify-center items-center ${isLandscape ? 'px-6' : 'px-4'}`}>
            {/* Title */}
            <Animated.View entering={FadeInDown.duration(600).delay(200)} style={{ marginBottom: 20 }}>
              <Text className="text-3xl font-bold text-black pb-10">Login</Text>
            </Animated.View>

            {/* Email Input */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(400)}
              className={`max-w-md w-full ${isLandscape ? 'mb-2' : 'mb-4'}`}
              onLayout={(event) => {
                const { y } = event.nativeEvent.layout;
                emailInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  handleInputFocus('email', pageY - 100);
                });
              }}
            >
              <LinearGradient
                colors={['#A855F7', '#F472B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-full p-[2px]"
                style={styles.gradient}
              >
                <TextInput
                  ref={emailInputRef}
                  className={`w-full bg-white text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'}`}
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => {
                    emailInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                      handleInputFocus('email', pageY - 100);
                    });
                  }}
                />
              </LinearGradient>
              {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
            </Animated.View>

            {/* Password Input */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(500)}
              className="max-w-md w-full relative"
              onLayout={(event) => {
                const { y } = event.nativeEvent.layout;
                passwordInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  handleInputFocus('password', pageY - 100);
                });
              }}
            >
              <LinearGradient
                colors={['#A855F7', '#F472B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-full p-[2px]"
                style={styles.gradient}
              >
                <TextInput
                  ref={passwordInputRef}
                  className={`w-full bg-white text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'}`}
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  onFocus={() => {
                    passwordInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                      handleInputFocus('password', pageY - 100);
                    });
                  }}
                />
              </LinearGradient>
              <TouchableOpacity
                className="absolute right-4 top-1/2 -translate-y-1/2"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={RFValue(20)}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
              {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>}
            </Animated.View>

            {/* Error Message */}
            {error && <Text className="text-red-500 mt-2 text-sm">{error.message}</Text>}
          </View>

          <Animated.View
            entering={FadeIn.duration(600).delay(600)}
            className={`w-full items-center ${isLandscape ? 'px-6 pb-4' : 'px-4 pb-8'}`}
          >
            {/* Login Button */}
            <Button
              title={isPending ? 'Logging in...' : 'Log in'}
              onPress={handleLogin}
              isLandscape={isLandscape}
              width="full"
            />

            {/* Register Link */}
            <Animated.View entering={FadeInDown.duration(600).delay(800)} style={{ marginTop: 15 }}>
              <TouchableOpacity onPress={() => router.push('/screens/signup.screen')}>
                <Text className={`text-gray-600 ${isLandscape ? 'text-xs mb-4' : 'text-sm mb-6'}`}>
                  I don’t have an account
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <View className={`w-3/4 h-px bg-gray-300 ${isLandscape ? 'mb-4' : 'mb-6'}`} />

            {/* Social Login */}
            <Text className={`text-gray-600 ${isLandscape ? 'text-xs mb-2' : 'text-sm mb-4'}`}>
              Login with
            </Text>
            <View className={`flex-row justify-center ${isLandscape ? 'mb-4' : 'mb-6'}`}>
              <TouchableOpacity className="mx-2">
                <FontAwesome name="google" size={RFValue(30)} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity className="mx-2">
                <FontAwesome name="facebook" size={RFValue(30)} color="#000" />
              </TouchableOpacity>
              <TouchableOpacity className="mx-2">
                <MaterialCommunityIcons name="apple" size={RFValue(30)} color="#000" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <SuccessModal
        isVisible={isSuccessModalVisible}
        title="Connexion Réussie !"
        message="Vous êtes maintenant connecté à votre portefeuille crypto."
        onClose={() => {
          setIsSuccessModalVisible(false);
          router.push('/(tabs)/Home');
        }}
        duration={2000}
      />

      <StatusBar style="light" translucent={false} />
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
});

export default LoginScreen;