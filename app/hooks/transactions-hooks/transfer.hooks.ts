import { useMutation } from '@tanstack/react-query';
import {TransferData} from '../../models/types'


// API call to transfer PRX tokens
const transferTokens = async (data: TransferData): Promise<boolean> => {
  const url = 'http://192.168.11.38:3000/transaction/transfer/prx' 
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (res.status === 200 || res.status === 201) {
    return true;
  } else if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.errorDetails?.message || 'Transfer failed');
  }
  return false;
};

// API call to transfer USDT tokens
const transferUSDT = async (data: TransferData): Promise<boolean> => {
    const url = 'http://192.168.11.38:3000/transaction/transfer/usdt' 
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  
    if (res.status === 200 || res.status === 201) {
      return true;
    } else if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.errorDetails?.message || 'Transfer failed');
    }
    return false;
  };

// Custom hook for transferring tokens
export const useTransferPRX = () => {
  return useMutation({
    mutationFn: transferTokens,
  });
};

export const useTransferUSDT = () => {
    return useMutation({
      mutationFn: transferUSDT,
    });
  };