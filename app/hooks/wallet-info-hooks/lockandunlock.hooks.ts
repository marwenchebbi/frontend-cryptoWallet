// hooks/useWalletMutations.ts
import axiosInstance from '@/app/interceptors/axiosInstance';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';



interface LockWalletDTO {
  userId: string;
  walletAddress: string;
}

interface UnlockWalletDTO {
  userId: string;
  walletAddress: string;
  password: string;
}

export const useWalletMutations = () => {
  const queryClient = useQueryClient();

  const lockWalletMutation = useMutation({
    mutationFn: async ({ userId, walletAddress }: LockWalletDTO) => {
      const response = await axiosInstance.post(`/wallet/lock`, {
        userId,
        walletAddress,
      });
      return response.data;
    },
    onSuccess: async (data) => {
      await SecureStore.setItemAsync('isWalletLocked', 'true');
      queryClient.invalidateQueries({ queryKey: ['walletInfo'] });
      
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.message || 'Failed to lock wallet');
    },
  });

  const unlockWalletMutation = useMutation({
    mutationFn: async ({ userId, walletAddress, password }: UnlockWalletDTO) => {
      const response = await axiosInstance.post(`/wallet/unlock`, {
        userId,
        walletAddress,
        password,
      });
      return response.data;
    },
    onSuccess: async (data) => {
      await SecureStore.setItemAsync('isWalletLocked', 'false');
      queryClient.invalidateQueries({ queryKey: ['walletInfo'] });
      
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.errorDetails.message || 'Failed to unlock wallet');
    },
  });

  return {
    lockWallet: lockWalletMutation.mutate,
    unlockWallet: unlockWalletMutation.mutate,
    isLocking: lockWalletMutation.isPending,
    isUnlocking: unlockWalletMutation.isPending,
    
  };
};