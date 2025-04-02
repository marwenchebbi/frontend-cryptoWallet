import React, { useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { RFValue } from 'react-native-responsive-fontsize';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useOrientation } from '../hooks/shared/useOrientation';
import { useHandleBack } from '../hooks/shared/useHandleBack';
import { useLogin } from '../hooks/auth-hooks/LoginHooks'; // Adjust path
import { LoginData } from '../models/types';
import Header from '@/components/Header';
import Button from '@/components/Button';
import * as SecureStore from 'expo-secure-store'
import { validateForm } from '../validators/helpers';
import { loginSchema } from '../validators/auth.validator';

const LoginScreen: React.FC = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const isLandscape = useOrientation();
  const handleBack = useHandleBack();
  const { mutate, isPending, error } = useLogin();

  const submitLogin = () => {
    mutate(formData, {
      onSuccess: async (data: any) => {
        // Handle successful login (e.g., store tokens, navigate)
        // Store tokens securely using SecureStore
        await SecureStore.setItemAsync('accessToken', data.accessToken);
        await SecureStore.setItemAsync('refreshToken', data.refreshToken);
        await SecureStore.setItemAsync('userId', data.userId.toString());
        //testing 
        console.log('Login success \n tokens stored securely');
        const id = await SecureStore.getItem('userId')
        console.log(`User ID : ${id}`)
        router.push('/');// i need to redirect the user to the home page
      },
      onError: (err: any) => {
        console.log('Login error:', err.message); // Optional debug
      },
    });
  };


  const handleLogin = async () => {
    const { errors, success } = await validateForm(formData, loginSchema)
    if(success){
      submitLogin()
    }
    else{
      setErrors(errors)
    }
  }

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors({})
    
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
          <Header title="Login" onBackPress={handleBack} isLandscape={isLandscape} />

          <View className={`flex-1 justify-center items-center ${isLandscape ? 'px-6' : 'px-4'}`}>
            {/* Email Input */}
            <View className={`max-w-md w-full ${isLandscape ? 'mb-2' : 'mb-4'}`}>
              <LinearGradient
                colors={['#A855F7', '#F472B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-full p-[2px]"
                style={styles.gradient}
              >
                <TextInput
                  className={`w-full bg-white text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
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

            {/* Password Input */}
            <View className="max-w-md w-full relative">
              <LinearGradient
                colors={['#A855F7', '#F472B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-full p-[2px]"
                style={styles.gradient}
              >
                <TextInput
                  className={`w-full bg-white text-black ${isLandscape ? 'py-2 px-3 text-sm' : 'py-3 px-4 text-base'
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
              {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>}
            </View>

            {/* Error Message */}
            {error && (
              <Text className="text-red-500 mt-2 text-sm">{error.message}</Text>
            )}
          </View>

          <View className={`w-full items-center ${isLandscape ? 'px-6 pb-4' : 'px-4 pb-8'}`}>
            {/* Login Button */}
            <Button
              title="Login"
              onPress={handleLogin}
              isLandscape={isLandscape}
              width="full"
            />
            {isPending && <ActivityIndicator size="small" color="#A855F7" />}

            {/* "I don't have an account" Link */}
            <TouchableOpacity onPress={() => router.push('/screens/SignupScreen')}>
              <Text className={`text-gray-600 ${isLandscape ? 'text-xs mb-4' : 'text-sm mb-6'}`}>
                I don’t have an account
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View className={`w-3/4 h-px bg-gray-300 ${isLandscape ? 'mb-4' : 'mb-6'}`} />

            {/* "Login with" Section */}
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

export default LoginScreen;