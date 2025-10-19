'use client';

import { useState, useEffect } from 'react';
import tradingService from '@/lib/services/tradingService';

export default function TradingTest() {
  const [cryptoData, setCryptoData] = useState([]);
  const [forexData, setForexData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [crypto, forex, stocks] = await Promise.all([
          tradingService.getCryptoData(),
          tradingService.getForexData(),
          tradingService.getStockData()
        ]);
        
        setCryptoData(crypto);
        setForexData(forex);
        setStockData(stocks);
      } catch (err) {
        setError(err.message);
        console.error('Test error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="text-center mt-2">Loading trading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Trading API Test Results</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Crypto Data */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Cryptocurrency</h4>
          <div className="space-y-2">
            {cryptoData.map((crypto, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <p className="font-medium">{crypto.symbol}</p>
                <p className="text-sm text-gray-600">${crypto.price.toFixed(2)}</p>
                <p className={`text-sm ${crypto.change24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {crypto.change24h > 0 ? '+' : ''}{crypto.change24h.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Forex Data */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Forex</h4>
          <div className="space-y-2">
            {forexData.map((forex, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <p className="font-medium">{forex.currency}</p>
                <p className="text-sm text-gray-600">{forex.rate.toFixed(4)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Data */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Stocks</h4>
          <div className="space-y-2">
            {stockData.map((stock, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <p className="font-medium">{stock.symbol}</p>
                <p className="text-sm text-gray-600">${stock.price.toFixed(2)}</p>
                <p className={`text-sm ${stock.changePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
