// components/TransactionItem.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { TransactionType } from '../models/transaction';


interface TransactionItemProps {
  transaction: any;
  userId: string;
  transactionType: TransactionType;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, userId, transactionType }) => {
  const isSender = transaction.sender_id && transaction.sender_id.toString() === userId;
  const operation = transaction.operation || 'sell';
  const isBuy = operation === 'buy';
  const operationText =
    transactionType === TransactionType.TRADING
      ? isBuy
        ? 'Buy'
        : 'Sell'
      : isSender
      ? 'Send'
      : 'Received';
  const operationColor = isBuy ? 'text-red-500' : 'text-green-500';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View className="border border-purple-300 rounded-lg p-4 mb-2 flex-row justify-between items-center">
      <View>
        <Text className="text-black font-semibold text-base">
          Proxym <Text className={operationColor}>({operationText})</Text>
        </Text>
        <Text className="text-gray-500 text-sm mt-1">{formatDate(transaction.date)}</Text>
      </View>
      <Text className={`text-sm font-bold text-right ${operationColor}`}>
        {isBuy ? '-' : '+'}${transaction.amount.toFixed(2)}
      </Text>
    </View>
  );
};

export default TransactionItem;