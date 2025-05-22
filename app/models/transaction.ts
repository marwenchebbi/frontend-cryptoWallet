// types/transaction.ts
export enum TransactionType {
    TRANSFER = 'transfer',
    TRADING = 'trading',
    PAYMENT = 'payment'
  }
  
  export interface TransferData {
    amount: string;
    senderAddress: string;
    receiverAddress?: string;
    inputCurrency?: 'USDT' | 'PRX';
  }
  
  export interface Transaction {
    type: string;
    amount: number;
    received_amount: number;
    date: string; // ISO date string
    operation?: 'buy' | 'sell';
    sender_id: string;
  }
  
  export interface TransactionHistoryResponse {
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }