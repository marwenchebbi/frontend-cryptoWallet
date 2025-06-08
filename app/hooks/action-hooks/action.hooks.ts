import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/interceptors/axiosInstance';
import { FormattedAction } from '@/app/models/action';

// API function to fetch user actions
const getUserActions = async (): Promise<FormattedAction[]> => {
  try {
    const response = await axiosInstance.get('/action/findById', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.errorDetails?.message || 'Failed to fetch actions.';
    throw new Error(errorMessage);
  }
};

// Custom hook for fetching user actions
export const useAction = () => {
  // Query for fetching user actions
  const getActions = () => ({
    queryKey: ['userAction'],
    queryFn: getUserActions,
    retry: 1,
    refetchOnWindowFocus: true,
  });

  return {
    getActions,
  };
};