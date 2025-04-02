// screens/SignupScreen.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RFValue } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useSignup } from '../hooks/auth-hooks/SignupHook';
import { SignupData } from '../models/types';
import Header from '../../components/Header';
import Button from '../../components/Button';
import { signupSchema } from '../validators/auth.validator';
import { validateForm } from '../validators/helpers';

// Yup validation schema


const SignupScreen: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignupData>({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<SignupData>>({});
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const { mutate, isPending, error: mutationError } = useSignup();


  // Submit signup request
  const submitSignup = () => {
    mutate(formData, {
      onSuccess: (success) => {
        if (success) {
          router.push('/screens/LoginScreen');
        }
      },
      onError: (err) => {
        console.log('Signup error:', err.message);
      },
    });
  };

  const handleSignup = async () => {
    const { errors , success } = await validateForm(formData,signupSchema);
    if (success) {
      submitSignup();
    }else{
      setErrors(errors);
    }
  };

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <Header title="Create Account" onBackPress={handleBack} isLandscape={isLandscape} />

          <View className={`flex-1 justify-center items-center ${isLandscape ? 'px-6' : 'px-4'}`}>
            <View className={`max-w-md w-full ${isLandscape ? 'mb-2' : 'mb-4'}`}>
              <LinearGradient
                colors={['#A855F7', '#F472B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-full p-[2px]"
                style={styles.gradient}
              >
                <TextInput
                  className={`w-full bg-white text-black ${
                    isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                  }`}
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#9CA3AF"
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                />
              </LinearGradient>
              {errors.name && <Text className="text-red-500 text-xs mt-1">{errors.name}</Text>}
            </View>

            <View className={`max-w-md w-full ${isLandscape ? 'mb-2' : 'mb-4'}`}>
              <LinearGradient
                colors={['#A855F7', '#F472B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-full p-[2px]"
                style={styles.gradient}
              >
                <TextInput
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
                />
              </LinearGradient>
              {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
            </View>

            <View className="max-w-md w-full relative">
              <LinearGradient
                colors={['#A855F7', '#F472B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-full p-[2px]"
                style={styles.gradient}
              >
                <TextInput
                  className={`w-full bg-white text-black ${
                    isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
                  }`}
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
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
            </View>

            {mutationError && (
              <Text className="text-red-500 mt-2 text-sm">{mutationError.message}</Text>
            )}
          </View>

          <View className={`w-full items-center ${isLandscape ? 'px-6 pb-4' : 'px-4 pb-8'}`}>
            <Button
              title="Sign up"
              onPress={handleSignup}
              isLandscape={isLandscape}
              width="full"
            />
            {isPending && <ActivityIndicator size="small" color="#A855F7" />}

            <TouchableOpacity onPress={() => router.push('/screens/LoginScreen')}>
              <Text className={`text-gray-600 ${isLandscape ? 'text-xs mb-4' : 'text-sm mb-6'}`}>
                I already have an account
              </Text>
            </TouchableOpacity>

            <View className={`w-3/4 h-px bg-gray-300 ${isLandscape ? 'mb-4' : 'mb-6'}`} />

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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
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