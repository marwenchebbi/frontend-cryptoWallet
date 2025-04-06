import { useMutation } from '@tanstack/react-query';
import { TransferData } from '../../models/types';

// API call to buy PRX
const buyPRX = async (data: TransferData): Promise<boolean> => {
  const url = 'http://192.168.1.14:3000/transaction/buy'; // Adjust endpoint as needed
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
    throw new Error(errorData.errorDetails?.message || 'Buy failed');
  }
  return false;
};

// API call to sell PRX
const sellPRX = async (data: TransferData): Promise<boolean> => {
  const url = 'http://192.168.1.14:3000/transaction/sell'; // Adjust endpoint as needed
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
    throw new Error(errorData.errorDetails?.message || 'Sell failed');
  }
  return false;
};

// Custom hooks for buy and sell
export const useBuyPRX = () => {
  return useMutation({
    mutationFn: buyPRX,
  });
};

export const useSellPRX = () => {
  return useMutation({
    mutationFn: sellPRX,
  });
};


