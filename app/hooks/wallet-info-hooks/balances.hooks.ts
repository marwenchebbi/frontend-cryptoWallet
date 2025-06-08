import axios from 'axios';

import { useQuery } from "@tanstack/react-query";
import axiosInstance from '@/app/interceptors/axiosInstance';

// Define the response type based on your backend
interface WalletInfoDTO {
  address: string;
  prxBalance: number; // Adjust type if it's a number or BigNumber
  usdtBalance: number; // Adjust type if it's a number or BigNumber
}

// Function to fetch wallet info using Axios
const getWalletInfo = async (address: string): Promise<WalletInfoDTO> => {
  const url = `/wallet/info?address=${encodeURIComponent(address)}`;

  try {
    const response = await axiosInstance.get<WalletInfoDTO>(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data; // Axios automatically parses the JSON response, so you can directly return the data
  } catch (error: any) {

   

    // Axios error handling, provide the error message
    if (axios.isAxiosError(error)) {
      // Specific Axios error handling (e.g., network issues)
      throw new Error(error?.response?.data?.message || 'Failed to fetch wallet information.');
    } else {
      // General error handling
      throw new Error(error?.message || 'An unexpected error occurred.');
    }
  }
};

// Custom hook to get wallet info using React Query and Axios
export const useGetWalletInfo = (address: string) => {
  return useQuery<WalletInfoDTO, Error>({
    queryKey: ['walletInfo', address],
    queryFn: () => getWalletInfo(address),
    enabled: !!address, // Only fetch when address is provided
    refetchOnWindowFocus: true, // Ensures data refresh when the app gains focus
    retry: 1, // Retry the request once if it fails
  });
};
