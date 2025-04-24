import React, { useEffect, useState } from 'react';
import {
     BsArrowRight
     } from "react-icons/bs";
//   import { PiCurrencyInr, PiCurrencyEur } from "react-icons/pi";

const ExchangeRate = () => {
  const [rate, setRate] = useState(null);
  const [error, setError] = useState(null);
const url = process.env.NODE_ENV === 'production' ? '/api/exchange-rate' : 'http://localhost:4000/api/exchange-rate';
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setRate(data.rate.toFixed(2)); // Round to 2 decimal places
        setError(null); 
      } catch (err) {
        setError('Failed to fetch exchange rate');
      }
    };
  
    fetchExchangeRate(); // Fetch immediately on mount
  
    const interval = setInterval(() => {
      fetchExchangeRate();
    }, 60 * 60 * 1000); // Update every hour
  
    return () => clearInterval(interval);
            // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) return <div>{error}</div>;

  return (
    <div className={'exchangeRate'}>
      {rate ? (
        <div>EUR 
        {/* <PiCurrencyEur /> */}
            {/* <BsArrowRight size={30} /> */}=
            <span
              style={{ marginLeft: '8px' }}
            >{rate}</span> INR
            {/* <PiCurrencyInr /> */}
        </div>
      ) : (
        <div>Loading exchange rate...</div>
      )}
    </div>
  );
};

export default ExchangeRate;
