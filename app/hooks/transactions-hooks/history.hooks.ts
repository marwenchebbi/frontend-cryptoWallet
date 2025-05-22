import { TransactionHistoryResponse, TransactionType } from '@/app/models/transaction';
import { IP_ADDRESS } from '@/app/models/types';
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { ErrorResponse } from '@/app/models/error';
import axiosInstance from '@/app/interceptors/axiosInstance';

// API function to fetch transaction history
const fetchTransactionHistory = async (
  page: number,
  limit: number,
  sort: string,
  type?: TransactionType,
  filter?: string | null
): Promise<TransactionHistoryResponse> => {


  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort,
    ...(type ? { type: type.toString() } : {}),
    ...(filter ? { filter } : {}),
  });

  try {
    const response = await axiosInstance.get<TransactionHistoryResponse>(
      `/transaction/user/?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',

        },
      }
    );
    return response.data;
  } catch (error: any) {
    const errorData: ErrorResponse = error.response.data;
    const message = errorData.errorDetails?.message || 'Failed to fetch transaction history:';
    throw new Error(message);
  }
};

// Custom hook to fetch transaction history
export const useTransactionHistory = (
 
  page: number = 1,
  limit: number = 10,
  sort: string = '-createdAt',
  type?: TransactionType,
  filter?: string | null
) => {
  return useQuery<TransactionHistoryResponse, Error>({
    queryKey: ['transactionHistory',  page, limit, sort, type, filter],
    queryFn: () => fetchTransactionHistory( page, limit, sort, type, filter),
    retry: 1,
    refetchOnWindowFocus: true,
  });
};
