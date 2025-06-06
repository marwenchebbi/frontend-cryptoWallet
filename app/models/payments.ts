
// Types
export interface IntentResponse {
    clientSecret: string;
}

export interface CreatePaymentIntentRequest {
    amount: number;
    senderAddress: string;
    currency: 'PRX' | 'USDT';
}

export interface ConfirmPaymentRequest {
    paymentIntentId: string;
}

export interface SellCryptoRequest {
    amount: number;
    userAddress: string;
    currency: 'PRX' | 'USDT';
    cardDetails: {
        name: string;
        email: string;
        paymentMethodId: string;
    };
}

export interface ConfirmSellRequest {
    payoutIntentId: string;
}