// Trading Data Service
// This service handles multiple trading APIs for comprehensive market data

const TRADING_APIS = {
  // Free APIs with good rate limits
  ALPHA_VANTAGE: {
    baseUrl: 'https://www.alphavantage.co/query',
    apiKey: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY,
    rateLimit: 5 // requests per minute
  },
  COINGECKO: {
    baseUrl: 'https://api.coingecko.com/api/v3',
    rateLimit: 50 // requests per minute
  },
  EXCHANGE_RATES: {
    baseUrl: 'https://api.exchangerate-api.com/v4/latest',
    rateLimit: 1000 // requests per month
  },
  YAHOO_FINANCE: {
    baseUrl: 'https://query1.finance.yahoo.com/v8/finance/chart',
    rateLimit: 2000 // requests per hour (no API key required)
  },
  BINANCE: {
    baseUrl: 'https://api.binance.com/api/v3',
    rateLimit: 1200 // requests per minute
  }
};

class TradingDataService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 30000; // 30 seconds
    this.subscribers = new Set();
  }

  // Subscribe to real-time updates
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify all subscribers
  notify(data) {
    this.subscribers.forEach(callback => callback(data));
  }

  // Check cache validity
  isCacheValid(key) {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  // Get cached data
  getCached(key) {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  // Set cache
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Fetch cryptocurrency data using CoinGecko API
  async getCryptoData(coinIds = ['bitcoin', 'ethereum', 'cardano', 'solana']) {
    const cacheKey = `crypto_${coinIds.join('_')}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached(cacheKey);
    }

    try {
      // Use CoinGecko API which is more reliable
      const response = await fetch(
        `${TRADING_APIS.COINGECKO.baseUrl}/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Get additional data for market cap and volume
      const marketDataResponse = await fetch(
        `${TRADING_APIS.COINGECKO.baseUrl}/coins/markets?vs_currency=usd&ids=${coinIds.join(',')}&order=market_cap_desc&per_page=10&page=1&sparkline=false`
      );
      
      let marketData = {};
      if (marketDataResponse.ok) {
        const marketDataArray = await marketDataResponse.json();
        marketDataArray.forEach(coin => {
          marketData[coin.id] = {
            marketCap: coin.market_cap,
            volume24h: coin.total_volume
          };
        });
      }

      const cryptoData = coinIds.map(coinId => {
        const coinData = data[coinId];
        const marketInfo = marketData[coinId] || {};
        
        return {
          symbol: coinId === 'bitcoin' ? 'BTC' : 
                 coinId === 'ethereum' ? 'ETH' :
                 coinId === 'cardano' ? 'ADA' :
                 coinId === 'solana' ? 'SOL' : coinId.toUpperCase(),
          name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
          price: coinData?.usd || 0,
          change24h: coinData?.usd_24h_change || 0,
          volume24h: marketInfo.volume24h || 0,
          marketCap: marketInfo.marketCap || 0,
          timestamp: Date.now()
        };
      });

      this.setCache(cacheKey, cryptoData);
      this.notify({ type: 'crypto', data: cryptoData });
      
      return cryptoData;
    } catch (error) {
      console.error('Error fetching crypto data from CoinGecko:', error);
      
      // Try Binance API as fallback
      try {
        const binanceSymbols = coinIds.map(coinId => {
          const symbolMap = {
            'bitcoin': 'BTCUSDT',
            'ethereum': 'ETHUSDT',
            'cardano': 'ADAUSDT',
            'solana': 'SOLUSDT'
          };
          return symbolMap[coinId] || `${coinId.toUpperCase()}USDT`;
        });

        const binancePromises = binanceSymbols.map(async (symbol) => {
          const response = await fetch(`${TRADING_APIS.BINANCE.baseUrl}/ticker/24hr?symbol=${symbol}`);
          if (!response.ok) throw new Error(`Binance API error for ${symbol}`);
          return response.json();
        });

        const binanceResults = await Promise.all(binancePromises);
        
        const binanceData = coinIds.map((coinId, index) => {
          const binanceData = binanceResults[index];
          return {
            symbol: coinId === 'bitcoin' ? 'BTC' : 
                   coinId === 'ethereum' ? 'ETH' :
                   coinId === 'cardano' ? 'ADA' :
                   coinId === 'solana' ? 'SOL' : coinId.toUpperCase(),
            name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
            price: parseFloat(binanceData.lastPrice),
            change24h: parseFloat(binanceData.priceChangePercent),
            volume24h: parseFloat(binanceData.volume),
            marketCap: 0, // Binance doesn't provide market cap
            timestamp: Date.now()
          };
        });

        this.setCache(cacheKey, binanceData);
        this.notify({ type: 'crypto', data: binanceData });
        return binanceData;
        
      } catch (binanceError) {
        console.error('Error fetching crypto data from Binance:', binanceError);
        
        // Final fallback to mock data
        const fallbackData = coinIds.map(coinId => ({
          symbol: coinId === 'bitcoin' ? 'BTC' : 
                 coinId === 'ethereum' ? 'ETH' :
                 coinId === 'cardano' ? 'ADA' :
                 coinId === 'solana' ? 'SOL' : coinId.toUpperCase(),
          name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
          price: coinId === 'bitcoin' ? 45000 : 
                 coinId === 'ethereum' ? 3000 :
                 coinId === 'cardano' ? 0.5 :
                 coinId === 'solana' ? 100 : 100,
          change24h: Math.random() * 10 - 5, // Random change between -5% and +5%
          volume24h: Math.random() * 1000000000, // Random volume
          marketCap: Math.random() * 1000000000000, // Random market cap
          timestamp: Date.now()
        }));
        
        this.setCache(cacheKey, fallbackData);
        return fallbackData;
      }
    }
  }

  // Fetch forex data
  async getForexData(baseCurrency = 'USD') {
    const cacheKey = `forex_${baseCurrency}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached(cacheKey);
    }

    try {
      const response = await fetch(`${TRADING_APIS.EXCHANGE_RATES.baseUrl}/${baseCurrency}`);
      if (!response.ok) throw new Error(`Exchange rates API error: ${response.status}`);
      
      const data = await response.json();
      const forexData = Object.entries(data.rates)
        .filter(([currency]) => ['NGN', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'].includes(currency))
        .map(([currency, rate]) => ({
          currency,
          rate: parseFloat(rate),
          baseCurrency,
          timestamp: Date.now()
        }));

      this.setCache(cacheKey, forexData);
      this.notify({ type: 'forex', data: forexData });
      
      return forexData;
    } catch (error) {
      console.error('Error fetching forex data:', error);
      
      // Fallback to mock forex data
      const fallbackData = [
        { currency: 'NGN', rate: 1500, baseCurrency, timestamp: Date.now() },
        { currency: 'EUR', rate: 0.85, baseCurrency, timestamp: Date.now() },
        { currency: 'GBP', rate: 0.73, baseCurrency, timestamp: Date.now() },
        { currency: 'JPY', rate: 110, baseCurrency, timestamp: Date.now() },
        { currency: 'CAD', rate: 1.25, baseCurrency, timestamp: Date.now() },
        { currency: 'AUD', rate: 1.35, baseCurrency, timestamp: Date.now() }
      ];
      
      this.setCache(cacheKey, fallbackData);
      return fallbackData;
    }
  }

  // Fetch stock market data using Alpha Vantage API
  async getStockData(symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA']) {
    const cacheKey = `stocks_${symbols.join('_')}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached(cacheKey);
    }

    try {
      // Try Alpha Vantage API first (free tier)
      const promises = symbols.map(async (symbol) => {
        const response = await fetch(
          `${TRADING_APIS.ALPHA_VANTAGE.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${TRADING_APIS.ALPHA_VANTAGE.apiKey}`
        );
        if (!response.ok) throw new Error(`Alpha Vantage API error for ${symbol}: ${response.status}`);
        return { symbol, ...await response.json() };
      });

      const results = await Promise.all(promises);
      const stockData = results.map(result => {
        const quote = result['Global Quote'];
        if (!quote || !quote['05. price']) {
          throw new Error(`No data for ${result.symbol}`);
        }
        
        return {
          symbol: result.symbol,
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          open: parseFloat(quote['02. open']),
          previousClose: parseFloat(quote['08. previous close']),
          timestamp: Date.now()
        };
      });

      this.setCache(cacheKey, stockData);
      this.notify({ type: 'stocks', data: stockData });
      
      return stockData;
    } catch (error) {
      console.error('Error fetching stock data from Alpha Vantage:', error);
      
      // Try Yahoo Finance API as fallback (no API key required)
      try {
        const yahooPromises = symbols.map(async (symbol) => {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
          );
          if (!response.ok) throw new Error(`Yahoo Finance API error for ${symbol}: ${response.status}`);
          return { symbol, ...await response.json() };
        });

        const yahooResults = await Promise.all(yahooPromises);
        const yahooData = yahooResults.map(result => {
          const chart = result.chart.result[0];
          const meta = chart.meta;
          
          const currentPrice = meta.regularMarketPrice;
          const previousClose = meta.previousClose || meta.chartPreviousClose;
          const change = previousClose ? currentPrice - previousClose : 0;
          const changePercent = previousClose ? (change / previousClose) * 100 : 0;
          
          return {
            symbol: result.symbol,
            price: currentPrice,
            change: change,
            changePercent: changePercent,
            high: meta.regularMarketDayHigh,
            low: meta.regularMarketDayLow,
            open: meta.regularMarketOpen || currentPrice,
            previousClose: previousClose || currentPrice,
            timestamp: Date.now()
          };
        });

        this.setCache(cacheKey, yahooData);
        this.notify({ type: 'stocks', data: yahooData });
        return yahooData;
        
      } catch (yahooError) {
        console.error('Error fetching stock data from Yahoo Finance:', yahooError);
        
        // Final fallback to realistic mock stock data
        const fallbackData = symbols.map(symbol => {
          const basePrices = {
            'AAPL': 150,
            'GOOGL': 2800,
            'MSFT': 300,
            'TSLA': 200
          };
          
          const basePrice = basePrices[symbol] || 100;
          const changePercent = (Math.random() * 10 - 5); // -5% to +5%
          const change = (basePrice * changePercent) / 100;
          
          return {
            symbol,
            price: basePrice + change,
            change: change,
            changePercent: changePercent,
            high: basePrice * 1.05,
            low: basePrice * 0.95,
            open: basePrice,
            previousClose: basePrice,
            timestamp: Date.now()
          };
        });
        
        this.setCache(cacheKey, fallbackData);
        return fallbackData;
      }
    }
  }

  // Get market overview
  async getMarketOverview() {
    const cacheKey = 'market_overview';
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached(cacheKey);
    }

    try {
      const [cryptoData, forexData, stockData] = await Promise.all([
        this.getCryptoData(),
        this.getForexData(),
        this.getStockData()
      ]);

      const overview = {
        crypto: cryptoData,
        forex: forexData,
        stocks: stockData,
        timestamp: Date.now(),
        totalMarkets: cryptoData.length + forexData.length + stockData.length
      };

      this.setCache(cacheKey, overview);
      this.notify({ type: 'overview', data: overview });
      
      return overview;
    } catch (error) {
      console.error('Error fetching market overview:', error);
      return this.getCached(cacheKey) || null;
    }
  }

  // Get trading spikes (significant price movements)
  async getTradingSpikes() {
    const cacheKey = 'trading_spikes';
    
    if (this.isCacheValid(cacheKey)) {
      return this.getCached(cacheKey);
    }

    try {
      const marketData = await this.getMarketOverview();
      const spikes = [];

      // Analyze crypto spikes (>5% change)
      marketData.crypto.forEach(crypto => {
        if (Math.abs(crypto.change24h) > 5) {
          spikes.push({
            type: 'crypto',
            symbol: crypto.symbol,
            name: crypto.name,
            price: crypto.price,
            change: crypto.change24h,
            volume: crypto.volume24h,
            severity: Math.abs(crypto.change24h) > 10 ? 'high' : 'medium',
            timestamp: Date.now()
          });
        }
      });

      // Analyze stock spikes (>3% change)
      marketData.stocks.forEach(stock => {
        if (Math.abs(stock.changePercent) > 3) {
          spikes.push({
            type: 'stock',
            symbol: stock.symbol,
            name: stock.symbol,
            price: stock.price,
            change: stock.changePercent,
            volume: null,
            severity: Math.abs(stock.changePercent) > 7 ? 'high' : 'medium',
            timestamp: Date.now()
          });
        }
      });

      // Sort by absolute change
      spikes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

      this.setCache(cacheKey, spikes);
      this.notify({ type: 'spikes', data: spikes });
      
      return spikes;
    } catch (error) {
      console.error('Error fetching trading spikes:', error);
      return this.getCached(cacheKey) || [];
    }
  }

  // Start real-time updates
  startRealTimeUpdates(interval = 30000) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      try {
        await this.getMarketOverview();
        await this.getTradingSpikes();
      } catch (error) {
        console.error('Error in real-time updates:', error);
      }
    }, interval);
  }

  // Stop real-time updates
  stopRealTimeUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

// Create singleton instance
const tradingService = new TradingDataService();

export default tradingService;
