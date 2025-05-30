// hooks/auth-hooks/useLogout.ts
import { LogoutResponse } from '@/app/models/auth';
import { IP_ADDRESS } from '@/app/models/types';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

import { ErrorResponse } from '@/app/models/error';
import axiosInstance from '../../interceptors/axiosInstance';

const logout = async (): Promise<LogoutResponse> => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) {
    throw new Error('No access token found');
  }

  try {
    const response = await axiosInstance.post<LogoutResponse>(
      `/auth/logout`,
      {}, // Corps vide
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorData: ErrorResponse = error.response.data;
      const message = errorData.errorDetails?.message || 'Logout failed';
      throw new Error(message);
    }
    throw new Error('Logout failed');
  }
};

export const useLogout = () => {
  return useMutation<LogoutResponse, Error>({
    mutationFn: logout,
    onSuccess: async (data) => {
      await Promise.all([
        SecureStore.deleteItemAsync('accessToken'),
        SecureStore.deleteItemAsync('refreshToken'),
        SecureStore.deleteItemAsync('walletAddress'),
        SecureStore.deleteItemAsync('userId'),
        //SecureStore.deleteItemAsync('TowFAEnabled'),
        SecureStore.deleteItemAsync('isWalletLocked')
      ]);
      console.log(data.message);
    },
    onError: (error) => {
      console.error('Logout failed:', error.message);
    },
  });
};
