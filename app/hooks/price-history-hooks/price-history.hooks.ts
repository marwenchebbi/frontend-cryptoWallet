import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/app/interceptors/axiosInstance";
import { PriceHistory } from "@/app/models/price-history";


// API function to fetch all price history records
const getPriceHistories = async (): Promise<PriceHistory[]> => {
  try {
    const response = await axiosInstance.get("/price-history", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.errorDetails?.message || "Failed to fetch price histories.";
    throw new Error(errorMessage);
  }
};

// Custom hook for price history operations
export const usePriceHistory = () => {
  // Query for fetching price histories
  const getPriceHistoriesQuery = useQuery<PriceHistory[], Error>({
    queryKey: ["priceHistories"],
    queryFn: getPriceHistories,
    refetchOnWindowFocus: true, // Refetch when window is focused
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    
   
  });

  return {
    getPriceHistories: getPriceHistoriesQuery,
    priceHistories: getPriceHistoriesQuery.data, // Direct access to data
    isLoading: getPriceHistoriesQuery.isLoading, // Loading state
    error: getPriceHistoriesQuery.error, // Error state
    refetch : getPriceHistoriesQuery.refetch
  };
};