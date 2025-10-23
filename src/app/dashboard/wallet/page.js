'use client';

import { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Minus, 
  ArrowUpRight, 
  ArrowDownRight,
  Eye, 
  EyeOff,
  CreditCard,
  Banknote,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  QrCode,
  Settings
} from 'lucide-react';

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const wallets = [
    {
      id: 'usd',
      currency: 'USD',
      name: 'US Dollar',
      balance: 1250.50,
      symbol: '$',
      color: 'green',
      change: '+2.5%',
      changeType: 'positive'
    },
    {
      id: 'ngn',
      currency: 'NGN',
      name: 'Nigerian Naira',
      balance: 1543200.00,
      symbol: '₦',
      color: 'green',
      change: '+1.8%',
      changeType: 'positive'
    },
    {
      id: 'eur',
      currency: 'EUR',
      name: 'Euro',
      balance: 850.25,
      symbol: '€',
      color: 'blue',
      change: '-0.5%',
      changeType: 'negative'
    },
    {
      id: 'btc',
      currency: 'BTC',
      name: 'Bitcoin',
      balance: 0.025,
      symbol: '₿',
      color: 'orange',
      change: '+5.2%',
      changeType: 'positive'
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      type: 'deposit',
      amount: 500000.00,
      currency: 'NGN',
      description: 'Bank Transfer Deposit',
      status: 'completed',
      date: '2024-12-19',
      time: '14:30',
      icon: ArrowDownRight,
      color: 'green'
    },
    {
      id: 2,
      type: 'exchange',
      amount: -230900.00,
      currency: 'NGN',
      description: 'USD to NGN Exchange',
      status: 'completed',
      date: '2024-12-19',
      time: '12:15',
      icon: ArrowUpRight,
      color: 'blue'
    },
    {
      id: 3,
      type: 'withdrawal',
      amount: -147000.00,
      currency: 'NGN',
      description: 'ATM Withdrawal',
      status: 'pending',
      date: '2024-12-18',
      time: '16:45',
      icon: ArrowUpRight,
      color: 'red'
    },
    {
      id: 4,
      type: 'exchange',
      amount: 150000.00,
      currency: 'NGN',
      description: 'NGN to USD Exchange',
      status: 'completed',
      date: '2024-12-18',
      time: '10:20',
      icon: ArrowDownRight,
      color: 'green'
    }
  ];

  const quickActions = [
    {
      id: 'deposit',
      name: 'Deposit',
      icon: Plus,
      color: 'green',
      description: 'Add money to your wallet'
    },
    {
      id: 'withdraw',
      name: 'Withdraw',
      icon: Minus,
      color: 'red',
      description: 'Withdraw money from your wallet'
    },
    {
      id: 'exchange',
      name: 'Exchange',
      icon: TrendingUp,
      color: 'blue',
      description: 'Convert between currencies'
    },
    {
      id: 'transfer',
      name: 'Transfer',
      icon: ArrowUpRight,
      color: 'purple',
      description: 'Send money to others'
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 mt-10">
        <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
        <p className="text-gray-600 mt-2">Manage your digital wallet and currencies.</p>
      </div>

      {/* Total Balance Card */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Total Portfolio Value</h3>
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
              <p className="text-4xl font-bold">#268,450.75</p>
            ) : (
              <p className="text-4xl font-bold">••••••</p>
            )}
            <p className="text-red-100 mt-2">+3.2% from last week</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-green-300">
              <TrendingUp className="h-5 w-5 mr-1" />
              <span className="text-sm font-medium">+#76,030.25</span>
            </div>
            <p className="text-red-100 text-sm">This week</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-center"
            >
              <div className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                action.color === 'green' ? 'bg-green-100' :
                action.color === 'red' ? 'bg-red-100' :
                action.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'
              }`}>
                <Icon className={`h-6 w-6 ${
                  action.color === 'green' ? 'text-green-600' :
                  action.color === 'red' ? 'text-red-600' :
                  action.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                }`} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{action.name}</h3>
              <p className="text-xs text-gray-600">{action.description}</p>
            </button>
          );
        })}
      </div>

      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  wallet.color === 'green' ? 'bg-green-100' :
                  wallet.color === 'blue' ? 'bg-blue-100' : 'bg-orange-100'
                }`}>
                  <span className={`text-lg font-bold ${
                    wallet.color === 'green' ? 'text-green-600' :
                    wallet.color === 'blue' ? 'text-blue-600' : 'text-orange-600'
                  }`}>
                    {wallet.symbol}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{wallet.currency}</h3>
                  <p className="text-sm text-gray-600">{wallet.name}</p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <Settings className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            
            <div className="mb-4">
              {showBalance ? (
                <p className="text-2xl font-bold text-gray-900">
                  {wallet.symbol}{wallet.balance.toLocaleString()}
                </p>
              ) : (
                <p className="text-2xl font-bold text-gray-900">••••••</p>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div className={`flex items-center text-sm ${
                wallet.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {wallet.changeType === 'positive' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{wallet.change}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Copy className="h-4 w-4 text-gray-400" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <QrCode className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <p className="text-gray-600 text-sm mt-1">Your latest wallet activities</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {recentTransactions.map((transaction) => {
              const Icon = transaction.icon;
              return (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${
                      transaction.color === 'green' ? 'bg-green-100' :
                      transaction.color === 'blue' ? 'bg-blue-100' : 'bg-red-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        transaction.color === 'green' ? 'text-green-600' :
                        transaction.color === 'blue' ? 'text-blue-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                      <p className="text-sm text-gray-500">{transaction.date} at {transaction.time}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.currency} {Math.abs(transaction.amount).toLocaleString()}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      {transaction.status === 'completed' ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-600">Completed</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-600">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <button className="w-full mt-6 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
