import React from 'react';
import { View, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { usePriceHistory } from '../hooks/price-history-hooks/price-history.hooks';
import { PriceHistory } from '../models/price-history';

interface DailyOHLC {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const TokenPriceChart: React.FC = () => {
  const { priceHistories, isLoading, error } = usePriceHistory();

  const groupByDay = (histories: PriceHistory[]): DailyOHLC[] => {
    const grouped: { [key: string]: PriceHistory[] } = {};

    // Group histories by date (YYYY-MM-DD)
    histories.forEach((history) => {
      const date = new Date(history.createdAt).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(history);
    });

    // Compute OHLC for each day
    return Object.keys(grouped)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-5) // Limit to last 5 days
      .map((date) => {
        const dayHistories = grouped[date];
        const prices = dayHistories.map((h) => h.price).sort((a, b) => a - b);
        return {
          date,
          open: dayHistories[0].price, // First price of the day
          high: prices[prices.length - 1], // Max price
          low: prices[0], // Min price
          close: dayHistories[dayHistories.length - 1].price, // Last price of the day
        };
      });
  };

  const formatChartData = (histories: PriceHistory[]) => {
    const dailyOHLC = groupByDay(histories);
    return {
      labels: dailyOHLC.map((ohlc) =>
        new Date(ohlc.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      ),
      datasets: [
        {
          data: dailyOHLC.map((ohlc) => ohlc.close),
          color: (opacity = 1) => `rgba(165, 85, 247, ${opacity})`, // Purple for close
          strokeWidth: 2,
        },
        {
          data: dailyOHLC.map((ohlc) => ohlc.high),
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // Green for high
          strokeWidth: 1,
        },
        {
          data: dailyOHLC.map((ohlc) => ohlc.low),
          color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // Red for low
          strokeWidth: 1,
        },
      ],
    };
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 4,
    color: (opacity = 1) => `rgba(165, 85, 247, ${opacity})`, // Default color
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#A855F7',
    },
  };

  const screenWidth = Dimensions.get('window').width - 40;

  if (isLoading) {
    return (
      <View className="p-4 pb-[90px]">
        <Text className="text-lg font-semibold mb-2">Token Price Evolution</Text>
        <Text>Loading price data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-4 pb-[90px]">
        <Text className="text-lg font-semibold mb-2">Token Price Evolution</Text>
        <Text>Error: {error.message}</Text>
      </View>
    );
  }

  if (!priceHistories || priceHistories.length === 0) {
    return (
      <View className="p-4 pb-[90px]">
        <Text className="text-lg font-semibold mb-2">Token Price Evolution</Text>
        <Text>No price history available.</Text>
      </View>
    );
  }

  const data = formatChartData(priceHistories);

  return (
    <View className="p-4 pb-[90px]">
      <Text className="text-lg font-semibold mb-2 text-center">PRX Price Evolution (Daily OHLC)</Text>
      <LineChart
        data={data}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default TokenPriceChart;