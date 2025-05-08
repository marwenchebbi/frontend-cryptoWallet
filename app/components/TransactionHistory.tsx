// components/TransactionHistory.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';

import TransactionItem from './TransactionItem';

import { useTransactionHistory } from '@/app/hooks/transactions-hooks/history.hooks';
import {  TransactionType } from '../models/transaction';

interface TransactionHistoryProps {
  userId: string;
  onLoadMore: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId, onLoadMore }) => {
  const { data, isLoading, error } = useTransactionHistory(userId, 1, 3, '-createdAt');

  if (isLoading) {
    return <ActivityIndicator size="small" color="#A855F7" />;
  }

  if (error) {
    return <Text className="text-red-500 text-center">Error loading transactions</Text>;
  }

  if (!data || data.transactions.length === 0) {
    return <Text className="text-gray-600 text-center">No transactions found</Text>;
  }

  return (
    <View>
      {data.transactions.slice(0, 3).map((transaction: any, index: number) => (
        
        <TransactionItem
          key={transaction.id || index}
          transaction={transaction}
          userId={userId}
          transactionType={(transaction.received_amount) ? TransactionType.TRADING : TransactionType.TRANSFER}
        />
      ))}
      <TouchableOpacity onPress={onLoadMore}>
        <Text className="text-purple-500 text-center mt-2">Load more</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TransactionHistory;