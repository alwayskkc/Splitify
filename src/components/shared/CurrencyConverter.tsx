import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface CurrencyConverterProps {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
}

const CurrencyConverter: React.FC<CurrencyConverterProps> = ({ amount, fromCurrency, toCurrency }) => {
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  useEffect(() => {
    const convertCurrency = async () => {
      try {
        const API_KEY = import.meta.env.VITE_REACT_APP_EXCHANGE_RATE_API_KEY;
        const response = await axios.get(
          `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${fromCurrency}`
        );
        
        if (response.data && response.data.conversion_rates) {
          const rate = response.data.conversion_rates[toCurrency];
          if (rate) {
            setConvertedAmount(amount * rate);
          }
        }
      } catch (error) {
        console.error('Error converting currency:', error);
      }
    };

    convertCurrency();
  }, [amount, fromCurrency, toCurrency]);

  if (convertedAmount === null) {
    return null;
  }

  return Math.ceil(convertedAmount).toFixed(2)
};

export default CurrencyConverter;