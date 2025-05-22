import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { IP_ADDRESS } from '../../models/types';
import { TransferData } from '@/app/models/transaction';
import axiosInstance from '@/app/interceptors/axiosInstance';
import { ErrorResponse } from '@/app/models/error';

// API call to transfer PRX tokens
const transferTokens = async (data: TransferData): Promise<boolean> => {
  try {
      const url = `transaction/transfer/prx`;

 
    const res = await axiosInstance.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return true
  } catch (error: any) {
    if (error.response && error.response.data) {
      const errorData: ErrorResponse = error.response.data;
      const message = errorData.errorDetails?.message || 'Failed to update profile';
      throw new Error(message);
    }
    throw new Error('Failed to update profile');
  }


};

// API call to transfer USDT tokens
const transferUSDT = async (data: TransferData): Promise<boolean> => {
  const url = `/transaction/transfer/usdt`;


    const res = await axiosInstance.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check the response status to determine success
    if (res.status === 200 || res.status === 201) {
      return true;
    } else {
      throw new Error(res.data.errorDetails?.message || 'Transfer failed');
    }

};

// Custom hook for transferring PRX tokens
export const useTransferPRX = () => {
  return useMutation({
    mutationFn: transferTokens,
  });
};

// Custom hook for transferring USDT tokens
export const useTransferUSDT = () => {
  return useMutation({
    mutationFn: transferUSDT,
  });
};
