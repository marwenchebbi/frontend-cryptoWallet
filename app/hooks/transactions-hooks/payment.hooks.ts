import axiosInstance from '@/app/interceptors/axiosInstance';
import { useMutation } from '@tanstack/react-query';


interface IntentResponse {
  clientSecret: string;
}

interface PaymentIntentPayload {
  amount: number;
  senderAddress: string;
  currency: string;
}

interface SellCryptoPayload {
  amount: number;
  userAddress: string;
  currency: string;
  cardDetails: {
    name: string;
    email: string;
    paymentMethodId: string;
  };
}

interface ConfirmPaymentPayload {
  paymentIntentId: string;
}

interface ConfirmSellPayload {
  payoutIntentId: string;
}

// Hook to create a payment intent for buying tokens
export const useCreatePaymentIntent = () => {
  return useMutation<IntentResponse, Error, PaymentIntentPayload>({
    mutationKey: ['createPaymentIntent'],
    mutationFn: async (payload: PaymentIntentPayload) => {
      const response = await axiosInstance.post<IntentResponse>('/payment/create-payment-intent', payload);
      return response.data;
    },
  });
};

// Hook to confirm a payment
export const useConfirmPayment = () => {
  return useMutation<void, Error, ConfirmPaymentPayload>({
    mutationKey: ['confirmPayment'],
    mutationFn: async (payload: ConfirmPaymentPayload) => {
      await axiosInstance.post('/payment/confirm-payment', payload);
    },
  });
};

// Hook to sell crypto
export const useSellCrypto = () => {
  return useMutation<IntentResponse, Error, SellCryptoPayload>({
    mutationKey: ['sellCrypto'],
    mutationFn: async (payload: SellCryptoPayload) => {
      const response = await axiosInstance.post<IntentResponse>('/payment/sell-crypto', payload);
      return response.data;
    },
  });
};

// Hook to confirm a sell transaction
export const useConfirmSell = () => {
  return useMutation<void, Error, ConfirmSellPayload>({
    mutationKey: ['confirmSell'],
    mutationFn: async (payload: ConfirmSellPayload) => {
      await axiosInstance.post('/payment/confirm-sell', payload);
    },
  });
};