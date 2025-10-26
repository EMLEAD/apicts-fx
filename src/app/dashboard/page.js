'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  BarChart3,
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  Coins,
  TrendingDown
} from 'lucide-react';
import TradingSpikesWidget from '@/Components/TradingSpikesWidget';
import MarketOverviewWidget from '@/Components/MarketOverviewWidget';
import TradingTest from '@/Components/TradingTest';
import { CryptoMarketOverview, CryptoTradingPair, CryptoIcon } from '@/Components/CryptoIcons';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user.username}!</h2>
        <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with your account today.</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Total Balance</h3>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {showBalance ? (
              <p className="text-4xl font-bold">₦500,450.00</p>
            ) : (
              <p className="text-4xl font-bold">••••••</p>
            )}
            <p className="text-red-100 mt-2">+2.5% from last month</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-green-500">
              <ArrowUpRight className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">+₦31,980.50</span>
            </div>
            <p className="text-red-100 text-sm">This month</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">+12.5%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">8,542</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">+8.2%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Exchange Rate</p>
              <p className="text-2xl font-bold text-gray-900">1.2345</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-red-600">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">-2.1%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₦4,500,678</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">+15.3%</span>
          </div>
        </div>
      </div>

      {/* Trading Data Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <TradingSpikesWidget />
        <MarketOverviewWidget />
      </div>

      {/* Crypto Market Section */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Coins className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Crypto Market Overview</h3>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span>Live Prices</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6">
            <CryptoMarketOverview />
          </div>
        </div>
      </div>

      {/* Crypto Trading Pairs */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Popular Trading Pairs</h3>
              </div>
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                View All Pairs
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <CryptoTradingPair 
                base="BTC" 
                quote="USDT" 
                price={43250.00} 
                change={2.45}
                onClick={() => console.log('BTC/USDT clicked')}
              />
              <CryptoTradingPair 
                base="ETH" 
                quote="USDT" 
                price={2650.00} 
                change={-1.23}
                onClick={() => console.log('ETH/USDT clicked')}
              />
              <CryptoTradingPair 
                base="BNB" 
                quote="USDT" 
                price={315.50} 
                change={0.87}
                onClick={() => console.log('BNB/USDT clicked')}
              />
              <CryptoTradingPair 
                base="ADA" 
                quote="USDT" 
                price={0.52} 
                change={3.21}
                onClick={() => console.log('ADA/USDT clicked')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trading API Test */}
      <div className="mb-8">
        <TradingTest />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { type: 'Exchange', amount: '+$1,250.00', status: 'Completed', time: '2 min ago', crypto: 'BTC' },
                { type: 'Transfer', amount: '-$500.00', status: 'Pending', time: '1 hour ago', crypto: 'ETH' },
                { type: 'Deposit', amount: '+$2,000.00', status: 'Completed', time: '3 hours ago', crypto: 'USDT' },
                { type: 'Withdrawal', amount: '-$750.00', status: 'Completed', time: '1 day ago', crypto: 'BNB' },
                { type: 'Crypto Buy', amount: '+0.05 BTC', status: 'Completed', time: '2 days ago', crypto: 'BTC' },
                { type: 'Crypto Sell', amount: '-2.5 ETH', status: 'Completed', time: '3 days ago', crypto: 'ETH' }
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'Exchange' ? 'bg-green-100' :
                      transaction.type === 'Transfer' ? 'bg-blue-100' :
                      transaction.type === 'Deposit' ? 'bg-purple-100' :
                      transaction.type === 'Crypto Buy' ? 'bg-orange-100' :
                      transaction.type === 'Crypto Sell' ? 'bg-red-100' :
                      'bg-gray-100'
                    }`}>
                      {transaction.type === 'Exchange' ? <TrendingUp className="h-4 w-4 text-green-600" /> :
                       transaction.type === 'Transfer' ? <ArrowUpRight className="h-4 w-4 text-blue-600" /> :
                       transaction.type === 'Deposit' ? <Wallet className="h-4 w-4 text-purple-600" /> :
                       transaction.type === 'Crypto Buy' ? <CryptoIcon symbol={transaction.crypto} size={16} className="text-orange-600" /> :
                       transaction.type === 'Crypto Sell' ? <CryptoIcon symbol={transaction.crypto} size={16} className="text-red-600" /> :
                       <CreditCard className="h-4 w-4 text-red-600" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.type}</p>
                      <p className="text-sm text-gray-500">{transaction.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount}
                    </p>
                    <p className={`text-sm ${
                      transaction.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors">
              View All Transactions
            </button>
          </div>
        </div>

        {/* Exchange Tools */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Exchange</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <div className="relative">
                  <select className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                    <option>GBP - British Pound</option>
                    <option>NGN - Nigerian Naira</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <div className="relative">
                  <select className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500">
                    <option>NGN - Nigerian Naira</option>
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                    <option>GBP - British Pound</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  placeholder="0.00"
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Exchange Rate</p>
                <p className="text-2xl font-bold text-gray-900">1 USD = 1,234.56 NGN</p>
              </div>
              <button className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
                Start Exchange
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
