'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Globe,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import tradingService from '@/lib/services/tradingService';

export default function MarketOverviewWidget() {
  const [marketData, setMarketData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Initial data fetch
    fetchMarketData();

    // Subscribe to real-time updates
    const unsubscribe = tradingService.subscribe((data) => {
      if (data.type === 'overview') {
        setMarketData(data.data);
        setLastUpdate(new Date());
        setIsConnected(true);
      }
    });

    // Start real-time updates
    tradingService.startRealTimeUpdates(30000); // Update every 30 seconds

    return () => {
      unsubscribe();
      tradingService.stopRealTimeUpdates();
    };
  }, []);

  const fetchMarketData = async () => {
    try {
      setIsLoading(true);
      const data = await tradingService.getMarketOverview();
      setMarketData(data);
      setLastUpdate(new Date());
      setIsConnected(true);
    } catch (error) {
      console.error('Error fetching market data:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(0)}`;
  };

  const formatChange = (change) => {
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const getChangeColor = (change) => {
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeBgColor = (change) => {
    return change > 0 ? 'bg-green-100' : 'bg-red-100';
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Unable to load market data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Market Overview</h3>
              <p className="text-sm text-gray-600">Live market data</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={fetchMarketData}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Last Update */}
        {lastUpdate && (
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Crypto Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="h-5 w-5 text-yellow-500" />
            <h4 className="font-semibold text-gray-900">Cryptocurrency</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketData.crypto.slice(0, 4).map((crypto) => (
              <div key={crypto.symbol} className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{crypto.symbol}</p>
                    <p className="text-sm text-gray-600">{crypto.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(crypto.price)}</p>
                    <p className={`text-sm font-medium ${getChangeColor(crypto.change24h)}`}>
                      {formatChange(crypto.change24h)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Forex Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="h-5 w-5 text-blue-500" />
            <h4 className="font-semibold text-gray-900">Forex (USD)</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketData.forex.slice(0, 4).map((forex) => (
              <div key={forex.currency} className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                <div className="text-center">
                  <p className="font-semibold text-gray-900">{forex.currency}</p>
                  <p className="text-lg font-bold text-gray-900">{forex.rate.toFixed(4)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stocks Section */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h4 className="font-semibold text-gray-900">Stocks</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketData.stocks.slice(0, 4).map((stock) => (
              <div key={stock.symbol} className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{stock.symbol}</p>
                    <p className="text-sm text-gray-600">Stock</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatPrice(stock.price)}</p>
                    <p className={`text-sm font-medium ${getChangeColor(stock.changePercent)}`}>
                      {formatChange(stock.changePercent)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-gray-900">{marketData.crypto.length}</p>
            <p className="text-xs text-gray-600">Crypto</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{marketData.forex.length}</p>
            <p className="text-xs text-gray-600">Forex</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{marketData.stocks.length}</p>
            <p className="text-xs text-gray-600">Stocks</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{marketData.totalMarkets}</p>
            <p className="text-xs text-gray-600">Total</p>
          </div>
        </div>
      </div>
    </div>
  );
}
