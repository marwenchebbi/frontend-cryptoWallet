// hooks/use2FAMutations.ts
import axiosInstance from '@/app/interceptors/axiosInstance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

interface Enable2FADTO {
   
  userId: string;
}

interface Disable2FADTO {
  userId: string;
}

export const use2FAMutations = () => {
  const queryClient = useQueryClient();

  const enable2FAMutation = useMutation({
    mutationFn: async ({ userId }: Enable2FADTO) => {
      const response = await axiosInstance.post(`auth/enable-2FA`, { userId });
      return response.data;
    },
    onSuccess: async (data) => {
      await SecureStore.setItemAsync('TowFAEnabled', 'true');
      queryClient.invalidateQueries({ queryKey: ['userSecurity'] });
     
      console.log(await SecureStore.getItemAsync('TowFAEnabled'))
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to enable 2FA');
    },
  });

  const disable2FAMutation = useMutation({
    mutationFn: async ({ userId }: Disable2FADTO) => {
      const response = await axiosInstance.post(`auth/disable-2FA`, { userId });
      return response.data;
    },
    onSuccess: async (data) => {
      await SecureStore.setItemAsync('TowFAEnabled', 'false');
      queryClient.invalidateQueries({ queryKey: ['userSecurity'] });
      console.log(await SecureStore.getItemAsync('TowFAEnabled'))
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to disable 2FA');
    },
  });

  return {
    enable2FA: enable2FAMutation.mutate,
    disable2FA: disable2FAMutation.mutate,
    isEnabling2FA: enable2FAMutation.isPending,
    isDisabling2FA: disable2FAMutation.isPending,
  };
};