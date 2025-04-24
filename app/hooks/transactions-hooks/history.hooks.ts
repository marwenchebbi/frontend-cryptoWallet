import { TransactionHistoryResponse, TransactionType } from '@/app/models/transaction';
import { IP_ADDRESS } from '@/app/models/types';
import { useQuery } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';

// Hook to fetch transaction history
const fetchTransactionHistory = async (
  userId: string,
  page: number,
  limit: number,
  sort: string,
  type?: TransactionType,
  filter?: string | null // Add filter parameter
): Promise<TransactionHistoryResponse> => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (!token) {
    throw new Error('No access token found');
  }

  // Build the query string with optional type and filter parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort,
    ...(type && { type: type.toString() }),
    ...(filter && { filter }), // Include filter if provided
  });

  const response = await fetch(
    `http://${IP_ADDRESS}:3000/transaction/user/${userId}?${queryParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to fetch transaction history: ${response.status}`);
  }

  return await response.json();
};

// Custom hook for transaction history
export const useTransactionHistory = (
  userId: string,
  page: number = 1,
  limit: number = 10,
  sort: string = '-createdAt',
  type?: TransactionType,
  filter?: string | null // Add filter parameter
) => {
  return useQuery<TransactionHistoryResponse, Error>({
    queryKey: ['transactionHistory', userId, page, limit, sort, type, filter], // Include filter in queryKey
    queryFn: () => fetchTransactionHistory(userId, page, limit, sort, type, filter),
    retry: 1,
    refetchOnWindowFocus: true,
    enabled: !!userId, // Only fetch when userId is available
  });
};