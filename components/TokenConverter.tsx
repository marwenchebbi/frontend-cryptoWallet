import { useState, useEffect, useCallback } from 'react';

// Define types
interface ConversionResult {
  equivalentAmount: number | null;
  isLoading: boolean;
  error: string | null;
}

export const useTokenConversion = (
  inputAmount: string,           // The amount user types
  inputCurrency: 'PRX' | 'USDT', // Input currency type
  exchangeRate: number,          // Current PRX/USDT exchange rate from your frontend
  debounceTime: number = 500     // Debounce time in milliseconds
) => {
  const [conversion, setConversion] = useState<ConversionResult>({
    equivalentAmount: null,
    isLoading: false,
    error: null,
  });

  // Calculate equivalent amount using the provided exchange rate
  const calculateEquivalent = useCallback(
    (amount: number) => {
      if (inputCurrency === 'PRX') {
        // PRX to USDT: multiply PRX amount by exchange rate
        return amount * exchangeRate;
      } else {
        // USDT to PRX: divide USDT amount by exchange rate
        return amount / exchangeRate;
      }
    },
    [inputCurrency, exchangeRate]
  );

  // Debounced conversion calculation
  useEffect(() => {
    const amount = parseFloat(inputAmount);
    
    // Reset if input is invalid or empty
    if (!amount || amount <= 0 || isNaN(amount)) {
      setConversion({
        equivalentAmount: null,
        isLoading: false,
        error: null,
      });
      return;
    }

    // If no exchange rate, show error
    if (!exchangeRate || exchangeRate <= 0) {
      setConversion({
        equivalentAmount: null,
        isLoading: false,
        error: 'Invalid exchange rate',
      });
      return;
    }

    const timer = setTimeout(() => {
      setConversion(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const equivalent = calculateEquivalent(amount);
        
        setConversion({
          equivalentAmount: Number(equivalent.toFixed(6)), // Round to 6 decimals
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setConversion({
          equivalentAmount: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Conversion failed',
        });
      }
    }, debounceTime);

    // Cleanup
    return () => clearTimeout(timer);
  }, [inputAmount, inputCurrency, exchangeRate, debounceTime, calculateEquivalent]);

  return conversion;
};

// Example usage in a component
interface TokenConverterProps {
  exchangeRate: number; // Pass the current exchange rate from your frontend
}

const TokenConverter: React.FC<TokenConverterProps> = ({ exchangeRate }) => {
  const [inputAmount, setInputAmount] = useState('');
  const [inputCurrency, setInputCurrency] = useState<'PRX' | 'USDT'>('USDT');

  const { equivalentAmount, isLoading, error } = useTokenConversion(
    inputAmount,
    inputCurrency,
    exchangeRate
  );

  return (
    <div>
      <div>
        <input
          type="number"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder={`Enter ${inputCurrency} amount`}
        />
        <select
          value={inputCurrency}
          onChange={(e) => setInputCurrency(e.target.value as 'PRX' | 'USDT')}
        >
          <option value="USDT">USDT</option>
          <option value="PRX">PRX</option>
        </select>
      </div>

      <div>
        {isLoading && <p>Calculating...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {equivalentAmount !== null && !isLoading && !error && (
          <p>
            Equivalent: {equivalentAmount} {inputCurrency === 'PRX' ? 'USDT' : 'PRX'}
          </p>
        )}
      </div>
    </div>
  );
};

export default TokenConverter;