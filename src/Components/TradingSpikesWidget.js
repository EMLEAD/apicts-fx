'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import tradingService from '@/lib/services/tradingService';

export default function TradingSpikesWidget() {
  const [spikes, setSpikes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Initial data fetch
    fetchTradingSpikes();

    // Subscribe to real-time updates
    const unsubscribe = tradingService.subscribe((data) => {
      if (data.type === 'spikes') {
        setSpikes(data.data);
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

  const fetchTradingSpikes = async () => {
    try {
      setIsLoading(true);
      const data = await tradingService.getTradingSpikes();
      setSpikes(data);
      setLastUpdate(new Date());
      setIsConnected(true);
    } catch (error) {
      console.error('Error fetching trading spikes:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getSpikeIcon = (change, severity) => {
    if (change > 0) {
      return severity === 'high' ? <Zap className="h-4 w-4 text-green-500" /> : <TrendingUp className="h-4 w-4 text-green-500" />;
    } else {
      return severity === 'high' ? <AlertTriangle className="h-4 w-4 text-red-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />;
    }
  };

  const getSpikeColor = (change, severity) => {
    if (change > 0) {
      return severity === 'high' ? 'text-green-600 bg-green-100' : 'text-green-600 bg-green-50';
    } else {
      return severity === 'high' ? 'text-red-600 bg-red-100' : 'text-red-600 bg-red-50';
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Activity className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Trading Spikes</h3>
              <p className="text-sm text-gray-600">Real-time market movements</p>
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
              onClick={fetchTradingSpikes}
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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : spikes.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No significant trading spikes detected</p>
            <p className="text-sm text-gray-400 mt-1">Market is relatively stable</p>
          </div>
        ) : (
          <div className="space-y-4">
            {spikes.slice(0, 8).map((spike, index) => (
              <div
                key={`${spike.symbol}-${spike.timestamp}`}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {getSpikeIcon(spike.change, spike.severity)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">{spike.symbol}</span>
                      <span className="text-xs text-gray-500 uppercase">{spike.type}</span>
                      {spike.severity === 'high' && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">
                          HIGH VOLATILITY
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{spike.name}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatPrice(spike.price)}</p>
                  <p className={`text-sm font-medium ${getSpikeColor(spike.change, spike.severity).split(' ')[0]}`}>
                    {formatChange(spike.change)}
                  </p>
                  {spike.volume && (
                    <p className="text-xs text-gray-500">
                      Vol: ${(spike.volume / 1000000).toFixed(1)}M
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {spikes.length > 8 && (
              <div className="text-center pt-4">
                <button className="text-red-600 text-sm font-medium hover:text-red-700">
                  View All {spikes.length} Spikes
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm font-medium text-gray-900">{spikes.length}</p>
            <p className="text-xs text-gray-600">Total Spikes</p>
          </div>
          <div>
            <p className="text-sm font-medium text-green-600">
              {spikes.filter(s => s.change > 0).length}
            </p>
            <p className="text-xs text-gray-600">Gainers</p>
          </div>
          <div>
            <p className="text-sm font-medium text-red-600">
              {spikes.filter(s => s.change < 0).length}
            </p>
            <p className="text-xs text-gray-600">Losers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
