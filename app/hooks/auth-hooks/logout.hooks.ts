// hooks/auth-hooks/useLogout.ts
import { LogoutResponse } from '@/app/models/auth';
import { IP_ADDRESS } from '@/app/models/types';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

const logout = async (): Promise<LogoutResponse> => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch(`http://${IP_ADDRESS}:3000/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Logout failed: ${response.status}`);
  }

  return response.json();
};

export const useLogout = () => {
  return useMutation<LogoutResponse, Error>({
    mutationFn: logout,
    onSuccess: async (data) => {
      await Promise.all([
        SecureStore.deleteItemAsync('accessToken'),
        SecureStore.deleteItemAsync('refreshToken'),
        SecureStore.deleteItemAsync('walletAddress'),
        SecureStore.deleteItemAsync('userId')
      ]);
      console.log(data.message);
    },
    onError: (error) => {
      console.error('Logout failed:', error.message);
    },
  });
};

