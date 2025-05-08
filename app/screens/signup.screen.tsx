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
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RFValue } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useSignup } from '../hooks/auth-hooks/signup.hooks';

import Header from '../components/Header';
import Button from '../components/Button';
import { signupSchema } from '../validators/auth.validator';
import { validateForm } from '../validators/helpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { SignupData } from '../models/auth';

const SignupScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<SignupData>>({});
  const [focusedInput, setFocusedInput] = useState<'name' | 'email' | 'password' | null>(null);
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const { mutate, isPending, error: mutationError } = useSignup();
  const [serverErrors, setServerErrors] =  useState<string>('')

  // Create refs for TextInputs and ScrollView
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Submit signup request
  const submitSignup = () => {
    mutate(formData, {
      onSuccess: (data) => {
        // Redirect to EmailVerificationScreen with email as a param
        router.push({
          pathname: '/screens/email-verification.screen',
          params: { email: formData.email },
        });
      },
      onError: (err: any) => {
        setErrors({ email: err.message || 'Signup failed' });
      },
    });
  };

  const handleSignup = async () => {
    const { errors, success } = await validateForm(formData, signupSchema);
    if (success) {
      submitSignup();
    } else {
      setErrors(errors);
    }
  };

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle focus and scroll to the input
  const handleInputFocus = (field: 'name' | 'email' | 'password', yPosition: number) => {
    setFocusedInput(field);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yPosition - 200, animated: true });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Animated.View
        entering={FadeIn.duration(600)}
        className="absolute top-0 left-0 right-0 z-40 bg-transparent"
        style={{ paddingTop: insets.top }}
      >
        <Header
          title="Create Account"
          onBackPress={handleBack}
          isLandscape={isLandscape}
          backEnabled={true}
          historyEnabled={false}
        />
      </Animated.View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 10}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="never"
        >
          <View className={`flex-1 justify-center items-center ${isLandscape ? 'px-6' : 'px-4'}`}>
            {/* Title */}
            <Animated.View entering={FadeInDown.duration(600).delay(200)} style={{ marginBottom: 20 }}>
              <Text className="text-3xl font-bold text-black pb-10">Sign Up</Text>
            </Animated.View>

            {/* Name Input */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(300)}
              className={`max-w-md w-full ${isLandscape ? 'mb-2' : 'mb-4'}`}
              onLayout={() => {
                nameInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  handleInputFocus('name', pageY - 200);
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
                  ref={nameInputRef}
                  className={`w-full bg-white text-black ${
                    isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                  }`}
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  onFocus={() => {
                    nameInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                      handleInputFocus('name', pageY - 200);
                    });
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => emailInputRef.current?.focus()}
                />
              </LinearGradient>
              {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>}
            </Animated.View>

            {/* Email Input */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(400)}
              className={`max-w-md w-full ${isLandscape ? 'mb-2' : 'mb-4'}`}
              onLayout={() => {
                emailInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  handleInputFocus('email', pageY - 200);
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
                  className={`w-full bg-white text-black ${
                    isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                  }`}
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(text) => handleInputChange('email', text)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => {
                    emailInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                      handleInputFocus('email', pageY - 200);
                    });
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />
              </LinearGradient>
              {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
            </Animated.View>

            {/* Password Input */}
            <Animated.View
              entering={FadeInDown.duration(600).delay(500)}
              className="max-w-md w-full relative"
              onLayout={() => {
                passwordInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                  handleInputFocus('password', pageY - 200);
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
                  className={`w-full bg-white text-black ${
                    isLandscape ? 'py-2 px-3 text-sm ' : 'py-3 px-4 text-base'
                  }`}
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  onFocus={() => {
                    passwordInputRef.current?.measure((x, y, width, height, pageX, pageY) => {
                      handleInputFocus('password', pageY - 200);
                    });
                  }}
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
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
              {errors.password && (
                <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>
              )}
            </Animated.View>


            {mutationError && (
              <Animated.View entering={FadeIn.duration(600).delay(600)}>
                <Text className="text-red-500 mt-2 text-sm">{mutationError.message}</Text>
              </Animated.View>
            )}
          </View>

          <Animated.View
            entering={FadeIn.duration(600).delay(600)}
            className={`w-full items-center ${isLandscape ? 'px-6 pb-4 ' : 'px-4 pb-8'}`}
          >
            {/* Signup Button */}
            <View className='flex-1 w-full my-3'>
            <Button
            
              title="Sign up"
              onPress={handleSignup}
              isLandscape={isLandscape}
              width="full"
            />
            </View>
            {isPending && (
              <Animated.View entering={FadeIn.duration(600).delay(700)}>
                <ActivityIndicator size="small" color="#A855F7" />
              </Animated.View>
            )}

            {/* Login Link */}
            <Animated.View entering={FadeInDown.duration(600).delay(800)} style={{ marginTop: 15 }}>
              <TouchableOpacity onPress={() => router.push('/screens/login.screen')}>
                <Text className={`text-gray-600 ${isLandscape ? 'text-xs mb-4' : 'text-sm mb-6'}`}>
                  I already have an account
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Divider */}
            <Animated.View entering={FadeIn.duration(600).delay(900)} style={{ width: '75%', height: 1, backgroundColor: '#D1D5DB', marginBottom: isLandscape ? 16 : 24 }} />

            {/* Social Login */}
            <Animated.View entering={FadeInDown.duration(600).delay(1000)}>
              <Text className={`text-gray-600 ${isLandscape ? 'text-xs mb-2' : 'text-sm mb-4'}`}>
                Sign up with
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
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
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

export default SignupScreen;