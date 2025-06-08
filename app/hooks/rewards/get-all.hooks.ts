import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/app/interceptors/axiosInstance';

// Type definition for reward response
export interface Reward {
  description?: string;  
  rewardPoints: number;
  completedOnTime: boolean;
  isClaimed: boolean;
  rewardedAt: string;

}

// API function to fetch user rewards
const getUserRewards = async (): Promise<Reward[]> => {
  try {
    const response = await axiosInstance.get('/reward', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.errorDetails?.message || 'Failed to fetch rewards.';
    throw new Error(errorMessage);
  }
};

// Custom hook for fetching user rewards
export const useRewards = () => {
  // Query for fetching user rewards
  const getRewards = () => ({
    queryKey: ['userRewards'],
    queryFn: getUserRewards,
    retry: 1,
    refetchOnWindowFocus: true,
  });

  return {
    getRewards,
  };
};