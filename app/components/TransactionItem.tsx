import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TransactionType } from '../models/transaction';

interface TransactionItemProps {
  transaction: any;
  userId: string|null;
  transactionType?: TransactionType;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, userId , transactionType }) => {
  // Determine if the user is the sender
  const isSender = transaction.sender_id && transaction.sender_id.toString() === userId;

  // Determine operation for trading transactions
  const operation = transaction.operation || 'sell';
  const isBuy = operation === 'buy';

  // Set currency based on trading operation
  const currency = isBuy ? 'PRX' : 'USDT';

  // Determine operation text
  const operationText =
    transactionType === TransactionType.TRADING
      ? isBuy
        ? 'Buy'
        : 'Sell'
      : isSender
      ? 'Send'
      : 'Received';

  // Set operation color based on operation text
  const operationColor =
    operationText === 'Buy'
      ? 'text-green-500'
      : operationText === 'Sell'
      ? 'text-red-500'
      : operationText === 'Send'
      ? 'text-orange-500'
      : 'text-blue-500';

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Africa/Tunis',
    });
  };

  return (
    <LinearGradient
      colors={['#A855F7', '#F472B6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      className="rounded-lg p-[2px] mb-4 mt-4"
      style={{ overflow: 'hidden' }}
    >
      <View className="bg-white rounded-lg p-4 flex-row justify-between items-center">
        <View>
          <Text className="text-black font-semibold text-base">
            {transactionType === TransactionType.TRADING ? 'PRX' : 'Transfer'}{' '}
            <Text className={operationColor}>({operationText})</Text>
          </Text>
          <Text className="text-gray-500 text-sm mt-1">{formatDate(transaction.date)}</Text>
        </View>
        <Text
          className={`text-sm font-bold text-right ${
            transactionType === TransactionType.TRADING
              ? isBuy
                ? 'text-gray-500'
                : 'text-gray-500'
              : isSender
              ? 'text-red-500'
              : 'text-green-500'
          }`}
        >
          {transactionType === TransactionType.TRADING
            ? isBuy
              ? `+ ${transaction.received_amount?.toFixed(2) || '0.00'} PRX \n - $${transaction.amount.toFixed(2)} USDT`
              : `+ $${transaction.received_amount?.toFixed(2) || '0.00'} USDT \n - ${transaction.amount.toFixed(2)} PRX`
            : `${isSender ? '-' : '+'} ${transaction.amount.toFixed(2)} ${currency}`}
        </Text>
      </View>
    </LinearGradient>
  );
};

export default TransactionItem;