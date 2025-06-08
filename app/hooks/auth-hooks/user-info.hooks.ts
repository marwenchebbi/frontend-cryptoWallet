
import { UserInfo } from '@/app/models/user';
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

import { ErrorResponse } from '@/app/models/error';
import axiosInstance from '../../interceptors/axiosInstance';

const fetchUserInfo = async (): Promise<UserInfo> => {

  try {
    const response = await axiosInstance.get(`/auth/me`, {
      headers: {
        'Content-Type': 'application/json',

      },
    });

    const data = response.data;

    return {
      name: data.userDetails.username,
      email: data.userDetails.email,
      walletAddress: data.userDetails.walletAddress,
      prxBalance: data.userDetails.prxBalance,
      usdtBalance: data.userDetails.usdtBalance,
      isWalletLocked : data.userDetails.isWalletLocked
    };
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorData: ErrorResponse = error.response.data;
      const message = errorData.errorDetails?.message || 'Failed to fetch user info';
      throw new Error(message);
    }
    throw new Error('Failed to fetch user info');
  }
};

export const useGetUserInfo = () => {
  return useQuery<UserInfo, Error>({
    queryKey: ['userInfo'],
    queryFn: fetchUserInfo,
    retry: 1,
    refetchOnWindowFocus: true,
  });
};
