import { useState } from 'react';
import axios from 'axios';
import { currencies } from '@/constants';

function MultiCurrency() {
  const [amount, setAmount] = useState<number | string>('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  const handleConvert = async () => {
    try {
      const API_KEY = import.meta.env.VITE_REACT_APP_EXCHANGE_RATE_API_KEY;
      if (!API_KEY) {
        alert('API key is missing. Please add your API key to the environment variables.');
        return;
      }

      const response = await axios.get(
        `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${fromCurrency}`
      );

      if (response.data && response.data.conversion_rates) {
        const rate = response.data.conversion_rates[toCurrency];
        if (rate) {
          setConvertedAmount(Number(amount) * rate);
        } else {
          alert('Could not fetch exchange rate for the selected currency.');
        }
      } else {
        console.error('Invalid response structure from the currency API:', response);
        alert('Unexpected response from the currency API. Please try again later.');
      }
    } catch (error) {
      console.error('Error converting currency:', error);
      alert('An error occurred while fetching the conversion rate. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center m-auto justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-light-1">Multi Currency Converter</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1 text-light-2">Amount</label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 bg-dark-4 text-light-1 rounded-lg border border-dark-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="fromCurrency" className="block text-sm font-medium mb-1 text-light-2">From</label>
              <select
                id="fromCurrency"
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-dark-4 text-light-1 rounded-lg border border-dark-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="toCurrency" className="block text-sm font-medium mb-1 text-light-2">To</label>
              <select
                id="toCurrency"
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-dark-4 text-light-1 rounded-lg border border-dark-4 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleConvert}
            className="w-full py-2 px-4 bg-primary-1990 text-light-1 font-semibold rounded-lg hover:bg-primary-600 transition duration-300 ease-in-out"
          >
            Convert
          </button>
        </div>
        {convertedAmount !== null && (
          <div className="mt-6 p-4 bg-dark-3 rounded-lg">
            <p className="text-center text-light-2">
              <span className="font-semibold">{amount} {fromCurrency}</span> is approximately
            </p>
            <p className="text-2xl font-bold text-center text-primary-500 mt-2">
              {convertedAmount.toFixed(2)} {toCurrency}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiCurrency;