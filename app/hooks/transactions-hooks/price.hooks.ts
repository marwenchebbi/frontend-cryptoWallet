import axios from 'axios';

import { useQuery } from "@tanstack/react-query";
import axiosInstance from '@/app/interceptors/axiosInstance';

// API function to fetch the PRX price using Axios
const getPrice = async (): Promise<number> => {
  const url = `/transaction/price`;

  try {
    const response = await axiosInstance.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if the response data is in the expected format
    if (typeof response.data === 'number') {
      return response.data;
    } else if (response.data && typeof response.data.price === 'number') {
      return response.data.price;
    } else {
      throw new Error('Invalid response format: price not found.');
    }
  } catch (error: any) {
    // Handle Axios errors
    const errorMessage = error.response?.data?.errorDetails?.message || 'Failed to retrieve price.';
    throw new Error(errorMessage);
  }
};

// Custom hook to retrieve the current price using Axios
export const useGetPrice = () => {
  return useQuery<number, Error>({
    queryKey: ['getPrice'],
    queryFn: getPrice,
    refetchOnWindowFocus: true,
  });
};
