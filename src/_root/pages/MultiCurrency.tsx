// src/_root/pages/MultiCurrency.tsx

import { useState } from 'react';
import axios from 'axios';
// Removed unused CSS import to avoid import error

function MultiCurrency() {
  // State to store amount, selected currencies, and the conversion result
  const [amount, setAmount] = useState(0);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('INR');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  // Function to handle conversion
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
      console.log(`API_KEY: ${API_KEY}`);
      console.log(`fromCurrency: ${fromCurrency}`);
      if (response.data && response.data.conversion_rates) {
        const rate = response.data.conversion_rates[toCurrency];
        if (rate) {
          setConvertedAmount(amount * rate);
        } else {
          alert('Could not fetch exchange rate for the selected currency.');
        }
      } else {
        console.error('Invalid response structure from the currency API:', response);
        alert('Unexpected response from the currency API. Please try again later.');
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Error response from the currency API:', error.response);
          alert('The currency conversion service responded with an error. Please try again later.');
        } else if (error.request) {
          console.error('No response received from the currency API:', error.request);
          alert('No response received from the currency conversion service. Please check the API endpoint or try again later.');
        } else {
          console.error('Axios error:', error.message);
          alert('An error occurred while fetching the conversion rate. Please try again.');
        }
      } else {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred while fetching the conversion rate. Please try again.');
      }
    }
  };



  return (
    <div className="multi-currency-container">
      <h2>Multi Currency Converter</h2>
      <div className="converter-form">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="Enter amount"
          style={{ color: 'black' }} // Fix text visibility issue
        />

        <select
          value={fromCurrency}
          onChange={(e) => setFromCurrency(e.target.value)}
          style={{ color: 'black' }} // Fix text visibility issue
        >
          <option value="USD">USD</option>
          <option value="INR">INR</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="CAD">CAD</option>
          {/* Add more currencies as needed */}
        </select>

        <select
          value={toCurrency}
          onChange={(e) => setToCurrency(e.target.value)}
          style={{ color: 'black' }} // Fix text visibility issue
        >
          <option value="USD">USD</option>
          <option value="INR">INR</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="CAD">CAD</option>
          {/* Add more currencies as needed */}
        </select>

        <button onClick={handleConvert}>Convert</button>
      </div>

      {convertedAmount !== null && (
        <div className="result">
          <p>
            {amount} {fromCurrency} is approximately {convertedAmount.toFixed(2)} {toCurrency}
          </p>
        </div>
      )}
    </div>
  );
}

export default MultiCurrency;
