import { useMutation } from '@tanstack/react-query';
import { IP_ADDRESS } from '@/app/models/types';
import { TransferData } from '@/app/models/transaction';
import axios from 'axios';
import { ErrorResponse } from '@/app/models/error';
import axiosInstance from '@/app/interceptors/axiosInstance';

// API call to buy PRX
const buyPRX = async (data: TransferData): Promise<boolean> => {
  try {
    const url = `/transaction/buy`;
    const response = await axiosInstance.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.status === 200 || response.status === 201;
  } catch (error: any) {
    const errorData: ErrorResponse = error.response.data;
    const message = errorData.errorDetails?.message || 'Account locked, please login again';
    throw new Error(message);
  }
};

// API call to sell PRX
const sellPRX = async (data: TransferData): Promise<boolean> => {
  try {
    const url = '/transaction/sell';
    const response = await axiosInstance.post(url, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.status === 200 || response.status === 201;
  } catch (error: any) {
    const errorData: ErrorResponse = error.response.data;
    const message = errorData.errorDetails?.message || 'Account locked, please login again';
    throw new Error(message);
  }
};

// Custom hooks for buy and sell
export const useBuyPRX = () => {
  return useMutation<boolean, Error, TransferData>({
    mutationFn: buyPRX,
  });
};

export const useSellPRX = () => {
  return useMutation<boolean, Error, TransferData>({
    mutationFn: sellPRX,
  });
};
