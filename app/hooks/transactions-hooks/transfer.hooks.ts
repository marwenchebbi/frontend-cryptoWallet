import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { IP_ADDRESS } from '../../models/types';
import { TransferData } from '@/app/models/transaction';
import axiosInstance from '@/app/interceptors/axiosInstance';

// API call to transfer PRX tokens
const transferTokens = async (data: TransferData): Promise<boolean> => {
  const url = `transaction/transfer/prx`;

 
    const res = await axiosInstance.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Axios automatically parses the response, so we can directly check the status
    if (res.status === 200 || res.status === 201) {
      return true;
    } else {
      throw new Error(res.data.errorDetails?.message || 'Transfer failed');
    }

};

// API call to transfer USDT tokens
const transferUSDT = async (data: TransferData): Promise<boolean> => {
  const url = `/transaction/transfer/usdt`;

  try {
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
  } catch (error: any) {
    const errorMessage = error.response?.data?.errorDetails?.message || 'Transfer failed';
    throw new Error(errorMessage);
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
