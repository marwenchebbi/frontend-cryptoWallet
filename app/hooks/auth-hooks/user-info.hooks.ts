// hooks/user-hooks/useGetUserInfo.ts
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

interface UserInfo {
  name: string;
  email: string;
  walletAddress: string;
  prxBalance: number;
  usdtBalance: number;
}

const fetchUserInfo = async (): Promise<UserInfo> => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) {
    throw new Error('No access token found');
  }

  const response = await fetch('http://192.168.1.14:3000/auth/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch user info: ${response.status}`);
  }

  const data = await response.json();
  // Extract userDetails and flatten to match UserInfo interface
  return {
    name: data.userDetails.username,
    email: data.userDetails.email,
    walletAddress: data.userDetails.walletAddress,
    prxBalance: data.userDetails.prxBalance,
    usdtBalance: data.userDetails.usdtBalance,
  };
};

export const useGetUserInfo = () => {
  return useQuery<UserInfo, Error>({
    queryKey: ['userInfo'],
    queryFn: fetchUserInfo,
    retry: 1,
    refetchOnWindowFocus: true,
  });
};