import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import Header from '@/app/components/Header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Button from '@/app/components/Button';
import { useEmailVerification } from '../hooks/auth-hooks/email_verification.hooks';

interface VerificationData {
  token: string;
}

const EmailVerificationScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<VerificationData>({ token: '' });
  const [errors, setErrors] = useState<Partial<VerificationData>>({});
  const [focusedInput, setFocusedInput] = useState<'token' | null>(null);
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const { verifyEmail, isVerifying, verifyError } = useEmailVerification();
  const tokenInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleVerify = () => {
    if (!formData.token) {
      setErrors({ token: 'Please enter a verification code' });
      return;
    }

    verifyEmail(
      { token: formData.token },
      {
        onSuccess: () => {
          router.push('/screens/login.screen');
        },
      }
    );
  };

  const handleInputChange = (field: keyof VerificationData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors({});
  };

  const handleInputFocus = (field: 'token', yPosition: number) => {
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
          title="Verify Email"
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
          keyboardShouldPersistTaps="never"
        >
          <View className={`flex-1 justify-center items-center ${isLandscape ? 'px-6' : 'px-4'}`}>
            {/* Title */}
            <Animated.View entering={FadeInDown.duration(600).delay(200)} style={{ marginBottom: 20 }}>
              <Text className="text-3xl font-bold text-black pb-10">Verify Email</Text>
            </Animated.View>

            {/* Verification Code Input */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(400)}
              className={`max-w-md w-full ${isLandscape ? 'mb-2' : 'mb-4'}`}
              onLayout={(event) => {
                const { y } = event.nativeEvent.layout;
                tokenInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  handleInputFocus('token', pageY - 100);
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
                  ref={tokenInputRef}
                  className={`w-full bg-white text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'}`}
                  style={styles.input}
                  placeholder="Verification Code"
                  placeholderTextColor="#9CA3AF"
                  value={formData.token}
                  onChangeText={(text) => handleInputChange('token', text)}
                  autoCapitalize="none"
                  onFocus={() => {
                    tokenInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                      handleInputFocus('token', pageY - 100);
                    });
                  }}
                />
              </LinearGradient>
              {errors.token && <Text className="text-red-500 text-xs mt-1">{errors.token}</Text>}
            </Animated.View>

            {/* Error Message */}
            {verifyError && <Text className="text-red-500 mt-2 text-sm">{verifyError}</Text>}
          </View>

          <Animated.View
            entering={FadeIn.duration(600).delay(600)}
            className={`w-full items-center ${isLandscape ? 'px-6 pb-4' : 'px-4 pb-8'}`}
          >
            {/* Verify Button */}
            <Button
              title="Verify"
              onPress={handleVerify}
              isLandscape={isLandscape}
              width="full"
         
            />

            {/* Divider */}
            <View className={`w-3/4 h-px bg-gray-300 ${isLandscape ? 'mb-4' : 'mb-6'}`} />

            {/* Back to Login Link */}
            <Animated.View entering={FadeInDown.duration(600).delay(800)} style={{ marginTop: 15 }}>
              <TouchableOpacity onPress={() => router.push('/screens/login.screen')}>
                <Text className={`text-gray-600 ${isLandscape ? 'text-xs mb-4' : 'text-sm mb-6'}`}>
                  Back to Login
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="dark" translucent={false} />
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
export default EmailVerificationScreen;