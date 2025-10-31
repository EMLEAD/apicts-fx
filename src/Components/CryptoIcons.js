import React from 'react';

// Crypto Icons Component
export const CryptoIcon = ({ symbol, size = 24, className = "" }) => {
  const cryptoIcons = {
    BTC: "₿",
    ETH: "Ξ", 
    BNB: "◉",
    ADA: "₳",
    SOL: "◎",
    XRP: "✕",
    DOT: "●",
    DOGE: "Ð",
    AVAX: "🔺",
    SHIB: "🐕",
    MATIC: "⬟",
    LINK: "🔗",
    UNI: "🦄",
    LTC: "Ł",
    ATOM: "⚛",
    USDT: "₮",
    USDC: "💵",
    DAI: "◈",
    BUSD: "₿"
  };

  const icon = cryptoIcons[symbol?.toUpperCase()] || "₿";
  
  return (
    <span 
      className={`inline-flex items-center justify-center ${className}`}
      style={{ fontSize: `${size}px`, width: `${size}px`, height: `${size}px` }}
    >
      {icon}
    </span>
  );
};

// Crypto Price Display Component
export const CryptoPrice = ({ symbol, price, change, changePercent, size = "md" }) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-base", 
    lg: "text-lg",
    xl: "text-xl"
  };

  const isPositive = change >= 0;
  
  return (
    <div className="flex items-center space-x-2">
      <CryptoIcon symbol={symbol} size={size === "sm" ? 16 : size === "lg" ? 32 : 24} />
      <div>
        <div className="flex items-center space-x-2">
          <span className="font-semibold">{symbol}</span>
          <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{changePercent?.toFixed(2)}%
          </span>
        </div>
        <div className={`${sizeClasses[size]} font-bold`}>
          ${price?.toFixed(2) || '0.00'}
        </div>
      </div>
    </div>
  );
};

// Crypto Trading Pair Component
export const CryptoTradingPair = ({ base, quote, price, change, onClick }) => {
  const isPositive = change >= 0;
  
  return (
    <div 
      className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="flex -space-x-2">
          <CryptoIcon symbol={base} size={24} className="bg-gray-100 rounded-full p-1" />
          <CryptoIcon symbol={quote} size={24} className="bg-gray-100 rounded-full p-1 border-2 border-white" />
        </div>
        <div>
          <div className="font-semibold text-gray-900">{base}/{quote}</div>
          <div className="text-sm text-gray-500">Trading Pair</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-gray-900">${price?.toFixed(2) || '0.00'}</div>
        <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{change?.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

// Crypto Market Overview Component
export const CryptoMarketOverview = ({ cryptos = [] }) => {
  const defaultCryptos = [
    { symbol: 'BTC', name: 'Bitcoin', price: 43250.00, change: 2.45, changePercent: 2.45 },
    { symbol: 'ETH', name: 'Ethereum', price: 2650.00, change: -1.23, changePercent: -1.23 },
    { symbol: 'BNB', name: 'Binance Coin', price: 315.50, change: 0.87, changePercent: 0.87 },
    { symbol: 'ADA', name: 'Cardano', price: 0.52, change: 3.21, changePercent: 3.21 },
    { symbol: 'SOL', name: 'Solana', price: 98.75, change: -2.15, changePercent: -2.15 },
    { symbol: 'XRP', name: 'Ripple', price: 0.62, change: 1.89, changePercent: 1.89 }
  ];

  const displayCryptos = cryptos.length > 0 ? cryptos : defaultCryptos;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayCryptos.map((crypto) => (
        <div key={crypto.symbol} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <CryptoPrice 
              symbol={crypto.symbol}
              price={crypto.price}
              change={crypto.change}
              changePercent={crypto.changePercent}
              size="md"
            />
          </div>
          <div className="text-sm text-gray-500">{crypto.name}</div>
        </div>
      ))}
    </div>
  );
};

export default CryptoIcon;

