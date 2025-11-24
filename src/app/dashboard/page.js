'use client';

import { useState, useEffect, useMemo } from 'react';
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

const formatCurrency = (amount, currency = 'NGN') => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(numericAmount);
};

const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '—';
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
};

const formatTransactionType = (type = '') =>
  type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const getTransactionEffect = (transaction) => {
  const amount = Number(transaction.amount) || 0;
  const direction = transaction.metadata?.direction;

  switch (transaction.type) {
    case 'deposit':
    case 'referral':
      return amount;
    case 'withdrawal':
      return -amount;
    case 'transfer':
    case 'exchange':
      if (direction === 'credit') return amount;
      if (direction === 'debit') return -amount;
      return -amount;
    default:
      return 0;
  }
};

const getTransactionPresentation = (transaction, fallbackCurrency = 'NGN') => {
  const direction = transaction.metadata?.direction;
  const amount = Number(transaction.amount) || 0;
  const currency = transaction.currency || fallbackCurrency;

  let Icon = CreditCard;
  let containerClass = 'bg-gray-100';
  let iconClass = 'text-gray-600';
  let credit = false;

  switch (transaction.type) {
    case 'deposit':
      Icon = ArrowDownRight;
      containerClass = 'bg-green-100';
      iconClass = 'text-green-600';
      credit = true;
      break;
    case 'withdrawal':
      Icon = ArrowUpRight;
      containerClass = 'bg-red-100';
      iconClass = 'text-red-600';
      break;
    case 'transfer':
      if (direction === 'credit') {
        Icon = ArrowDownRight;
        containerClass = 'bg-emerald-100';
        iconClass = 'text-emerald-600';
        credit = true;
      } else {
        Icon = ArrowUpRight;
        containerClass = 'bg-purple-100';
        iconClass = 'text-purple-600';
      }
      break;
    case 'exchange':
      Icon = BarChart3;
      containerClass = 'bg-blue-100';
      iconClass = 'text-blue-600';
      if (direction === 'credit') credit = true;
      break;
    case 'referral':
      Icon = TrendingUp;
      containerClass = 'bg-lime-100';
      iconClass = 'text-lime-600';
      credit = true;
      break;
    default:
      break;
  }

  const signedAmount = `${credit ? '+' : '-'}${formatCurrency(Math.abs(amount), currency)}`;
  const statusClass = transaction.status === 'completed'
    ? 'text-green-600'
    : transaction.status === 'pending'
      ? 'text-yellow-600'
      : 'text-red-600';

  return {
    Icon,
    containerClass,
    iconClass,
    signedAmount,
    credit,
    statusClass,
    label: formatTransactionType(transaction.type)
  };
};

const normalizeUser = (userData) => {
  if (!userData || typeof userData !== 'object') {
    return null;
  }

  return {
    ...userData,
    walletBalance: Number(userData.walletBalance ?? 0),
    currency: userData.currency || 'NGN'
  };
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    failedTransactions: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    currentMonthDeposit: 0,
    currentMonthWithdrawal: 0,
    monthlyNet: 0,
    previousMonthlyNet: 0,
    monthOverMonthChange: null,
    latestExchangeRate: null,
    latestExchangePair: null
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return () => {};
    }

    let isMounted = true;

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = normalizeUser(JSON.parse(storedUser));
        if (parsedUser && isMounted) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to parse stored user', error);
      }
    }

    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          const normalizedUser = normalizeUser(data.user);
          if (normalizedUser && isMounted) {
            setUser((prev) => ({ ...(prev || {}), ...normalizedUser }));
            localStorage.setItem('user', JSON.stringify(normalizedUser));
          }
        } else if (response.status === 401) {
          if (isMounted) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
          }
        } else {
          const errorPayload = await response.json().catch(() => ({}));
          console.error('Failed to fetch user profile:', errorPayload.error || response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    const fetchSummary = async () => {
      if (isMounted) {
        setSummaryLoading(true);
        setSummaryError(null);
      }

      try {
        const response = await fetch('/api/payments/transactions?limit=100', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
          if (response.status === 401) {
            if (isMounted) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/login');
            }
            return;
          }
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || 'Failed to fetch transactions');
        }

        const data = await response.json();
        const rows = (data.transactions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const totalCount = data.total ?? rows.length;

        let completedCount = 0;
        let pendingCount = 0;
        let failedCount = 0;
        let totalDeposits = 0;
        let totalWithdrawals = 0;
        let currentMonthDeposit = 0;
        let currentMonthWithdrawal = 0;
        let monthlyNet = 0;
        let previousMonthlyNet = 0;
        let latestExchange = null;

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        rows.forEach((transaction) => {
          const status = transaction.status;
          if (status === 'completed') completedCount += 1;
          else if (status === 'pending') pendingCount += 1;
          else if (status === 'failed' || status === 'cancelled') failedCount += 1;

          if (!latestExchange && transaction.type === 'exchange') {
            latestExchange = transaction;
          }

          if (status !== 'completed') return;

          const amount = Number(transaction.amount) || 0;
          const createdAt = transaction.createdAt ? new Date(transaction.createdAt) : null;

          if (transaction.type === 'deposit' || transaction.type === 'referral') {
            totalDeposits += amount;
          }

          if (transaction.type === 'withdrawal') {
            totalWithdrawals += amount;
          }

          const effect = getTransactionEffect(transaction);

          if (createdAt) {
            if (createdAt >= currentMonthStart) {
              monthlyNet += effect;
              if (transaction.type === 'deposit' || transaction.type === 'referral') {
                currentMonthDeposit += amount;
              }
              if (transaction.type === 'withdrawal') {
                currentMonthWithdrawal += amount;
              }
            } else if (createdAt >= previousMonthStart && createdAt <= previousMonthEnd) {
              previousMonthlyNet += effect;
            }
          }
        });

        const monthOverMonthChange = previousMonthlyNet !== 0
          ? ((monthlyNet - previousMonthlyNet) / Math.abs(previousMonthlyNet)) * 100
          : null;

        if (!isMounted) {
          return;
        }

        setSummary({
          totalTransactions: totalCount,
          completedTransactions: completedCount,
          pendingTransactions: pendingCount,
          failedTransactions: failedCount,
          totalDeposits,
          totalWithdrawals,
          currentMonthDeposit,
          currentMonthWithdrawal,
          monthlyNet,
          previousMonthlyNet,
          monthOverMonthChange,
          latestExchangeRate: latestExchange?.exchangeRate || latestExchange?.metadata?.rate || null,
          latestExchangePair: latestExchange?.metadata?.pair || null
        });
        setRecentTransactions(rows.slice(0, 6));
      } catch (error) {
        if (!isMounted) {
          return;
        }
        console.error('Dashboard summary error:', error);
        setSummaryError(error.message || 'Unable to load dashboard metrics');
      } finally {
        if (isMounted) {
          setSummaryLoading(false);
        }
      }
    };

    fetchUserProfile();
    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const currency = user?.currency || 'NGN';

  const netChange = summary.monthlyNet || 0;
  const isNetPositive = netChange >= 0;
  const netChangeLabel = summaryLoading
    ? 'Loading...'
    : `${isNetPositive ? '+' : '-'}${formatCurrency(Math.abs(netChange), currency)}`;

  const monthComparisonLabel = !summaryLoading && summary.monthOverMonthChange !== null
    ? `${summary.monthOverMonthChange >= 0 ? '+' : ''}${summary.monthOverMonthChange.toFixed(1)}% vs last month`
    : 'Month-to-date net change';

  const statValue = (value) => (summaryLoading ? '...' : value.toLocaleString());
  const statCurrency = (value) => (summaryLoading ? '...' : formatCurrency(value, currency));

  const latestExchangeInfo = useMemo(() => {
    if (!summary.latestExchangeRate) {
      return 'Awaiting exchange activity';
    }
    const pairLabel = summary.latestExchangePair || 'Latest exchange rate';
    return `${pairLabel}: ${summary.latestExchangeRate}`;
  }, [summary.latestExchangeRate, summary.latestExchangePair]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user.username}!</h2>
        <p className="text-gray-600 mt-2">Here&apos;s what&apos;s happening with your account today.</p>
        {summaryError && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {summaryError}
          </p>
        )}
      </div>

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
              <p className="text-4xl font-bold">{formatCurrency(user.walletBalance || 0, currency)}</p>
            ) : (
              <p className="text-4xl font-bold">••••••</p>
            )}
            <p className="text-red-100 mt-2">{netChangeLabel}</p>
          </div>
          <div className="text-right">
            <div className={`flex items-center ${isNetPositive ? 'text-green-300' : 'text-red-200'}`}>
              {isNetPositive ? (
                <ArrowUpRight className="h-5 w-5 mr-1" />
              ) : (
                <TrendingDown className="h-5 w-5 mr-1" />
              )}
              <span className="text-sm font-medium">{monthComparisonLabel}</span>
            </div>
            <p className="text-red-100 text-sm">Currency: {currency}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{statValue(summary.totalTransactions)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-green-600 text-sm">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>{summaryLoading ? 'Calculating...' : `${summary.completedTransactions.toLocaleString()} completed`}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{statValue(summary.completedTransactions)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-yellow-600 text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>{summaryLoading ? 'Pending...' : `${summary.pendingTransactions.toLocaleString()} pending`}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deposits</p>
              <p className="text-2xl font-bold text-gray-900">{statCurrency(summary.totalDeposits)}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Wallet className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-emerald-600 text-sm">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            <span>{summaryLoading ? 'This month...' : `${formatCurrency(summary.currentMonthDeposit, currency)} this month`}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Withdrawals</p>
              <p className="text-2xl font-bold text-gray-900">{statCurrency(summary.totalWithdrawals)}</p>
            </div>
            <div className="p-3 bg-rose-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-rose-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-rose-600 text-sm">
            <TrendingDown className="h-4 w-4 mr-1" />
            <span>{summaryLoading ? 'This month...' : `${formatCurrency(summary.currentMonthWithdrawal, currency)} this month`}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <TradingSpikesWidget />
        <MarketOverviewWidget />
      </div>

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

      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Popular Trading Pairs</h3>
              </div>
              <span className="text-sm text-gray-500">{latestExchangeInfo}</span>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              <CryptoTradingPair
                base="BTC"
                quote="USDT"
                price={43250.0}
                change={2.45}
                onClick={() => console.log('BTC/USDT clicked')}
              />
              <CryptoTradingPair
                base="ETH"
                quote="USDT"
                price={2650.0}
                change={-1.23}
                onClick={() => console.log('ETH/USDT clicked')}
              />
              <CryptoTradingPair
                base="BNB"
                quote="USDT"
                price={315.5}
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

      <div className="mb-8">
        <TradingTest />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="p-6">
            {summaryLoading ? (
              <p className="text-sm text-gray-500">Loading transactions...</p>
            ) : recentTransactions.length === 0 ? (
              <p className="text-sm text-gray-500">No transactions recorded yet.</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => {
                  const presentation = getTransactionPresentation(transaction, currency);
                  const IconComponent = presentation.Icon;
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${presentation.containerClass}`}>
                          <IconComponent className={`h-4 w-4 ${presentation.iconClass}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{presentation.label}</p>
                          <p className="text-sm text-gray-500">{formatRelativeTime(transaction.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${presentation.credit ? 'text-green-600' : 'text-red-600'}`}>
                          {presentation.signedAmount}
                        </p>
                        <p className={`text-sm capitalize ${presentation.statusClass}`}>
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button className="w-full mt-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors">
              View All Transactions
            </button>
          </div>
        </div>

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
                <p className="text-sm text-gray-600">Most recent exchange</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.latestExchangeRate ? summary.latestExchangeRate : 'No recent exchange data'}
                </p>
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
