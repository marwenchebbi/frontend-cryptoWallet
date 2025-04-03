import { useQuery, useQueryClient } from "@tanstack/react-query";

// Define the response type based on your backend
interface WalletInfoDTO {
  address: string;
  prxBalance: number; // Adjust type if it's a number or BigNumber
  usdtBalance: number; // Adjust type if it's a number or BigNumber
}

// Update walletInfoRequest to only need address since that's what the API expects
interface WalletInfoRequest {
  address: string;
}

const getWalletInfo = async (address: string): Promise<WalletInfoDTO> => {
  const url = `http://192.168.11.38:3000/wallet/info?address=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (res.status === 200 || res.status === 201) {
    return res.json(); // Parse the JSON response which should match WalletInfoDTO
  } else if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error fetching wallet information!');
  }
  throw new Error('Unexpected response status');
};

export const useGetWalletInfo = (address: string) => {
    const queryClient = useQueryClient();
  
    return useQuery({
      queryKey: ['walletInfo', address],
      queryFn: () => getWalletInfo(address),
      enabled: !!address,
      refetchOnWindowFocus: true, // Ensures data refresh when the app gains focus
    });
  };