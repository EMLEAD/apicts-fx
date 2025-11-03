'use client';

import { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Users, DollarSign, Eye, BarChart3, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const fallbackMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const fallbackWeekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalTransactions: 0,
    blogViews: 0,
    vlogViews: 0
  });
  const [userGrowth, setUserGrowth] = useState([]);
  const [transactionsByDay, setTransactionsByDay] = useState([]);
  const [transactionStatus, setTransactionStatus] = useState([]);
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/analytics', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({}));
          throw new Error(result.error || 'Failed to load analytics');
        }

        const data = await response.json();
        setAnalytics({
          totalUsers: data.totalUsers || 0,
          activeUsers: data.activeUsers || 0,
          newUsers: data.newUsers || 0,
          totalRevenue: data.totalRevenue || 0,
          monthlyRevenue: data.monthlyRevenue || 0,
          totalTransactions: data.totalTransactions || 0,
          blogViews: data.blogViews || 0,
          vlogViews: data.vlogViews || 0
        });
        setUserGrowth(data.userGrowth || []);
        setTransactionsByDay(data.transactions || []);
        setTransactionStatus(data.transactionStatus || []);
        setRevenueByMonth(data.revenueByMonth || []);
        setTopPages(data.topPages || []);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const chartUserGrowth = useMemo(() => {
    if (userGrowth.length > 0) {
      return userGrowth.map((item) => ({
        month: item.month,
        users: Number(item.users) || 0
      }));
    }
    return fallbackMonths.map((month) => ({ month, users: 0 }));
  }, [userGrowth]);

  const chartRevenue = useMemo(() => {
    if (revenueByMonth.length > 0) {
      return revenueByMonth.map((item) => ({
        month: item.month,
        revenue: Number(item.revenue) || 0
      }));
    }
    return fallbackMonths.map((month) => ({ month, revenue: 0 }));
  }, [revenueByMonth]);

  const chartTransactions = useMemo(() => {
    if (transactionsByDay.length > 0) {
      return transactionsByDay.map((item) => ({
        day: item.day,
        transactions: Number(item.transactions) || 0
      }));
    }
    return fallbackWeekdays.map((day) => ({ day, transactions: 0 }));
  }, [transactionsByDay]);

  const chartTransactionStatus = useMemo(() => {
    if (transactionStatus.length > 0) {
      return transactionStatus.map((item) => ({
        name: item.name,
        value: Number(item.value) || 0,
        color: item.color || '#6366f1'
      }));
    }
    return [
      { name: 'Completed', value: 0, color: '#22c55e' },
      { name: 'Pending', value: 0, color: '#eab308' },
      { name: 'Failed', value: 0, color: '#ef4444' }
    ];
  }, [transactionStatus]);

  const transactionsTotal = useMemo(() => (
    chartTransactionStatus.reduce((sum, item) => sum + item.value, 0) || 1
  ), [chartTransactionStatus]);

  const topPagesPeak = useMemo(() => (
    topPages.length > 0 ? Math.max(...topPages.map((page) => page.views || 0)) || 1 : 1
  ), [topPages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">Visual performance metrics powered by live data</p>
        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{analytics.totalUsers.toLocaleString()}</p>
            </div>
            <Users className="h-12 w-12 opacity-20" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm">{analytics.newUsers.toLocaleString()} new this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold">₦{analytics.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-12 w-12 opacity-20" />
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm">₦{analytics.monthlyRevenue.toLocaleString()} this month</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Transactions</p>
              <p className="text-3xl font-bold">{analytics.totalTransactions.toLocaleString()}</p>
            </div>
            <Activity className="h-12 w-12 opacity-20" />
          </div>
          <div className="mt-4 text-sm">
            {analytics.activeUsers.toLocaleString()} active users
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Content Views</p>
              <p className="text-3xl font-bold">
                {(analytics.blogViews + analytics.vlogViews).toLocaleString()}
              </p>
            </div>
            <Eye className="h-12 w-12 opacity-20" />
          </div>
          <div className="mt-4 text-sm">
            {analytics.blogViews.toLocaleString()} blog · {analytics.vlogViews.toLocaleString()} vlog
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">User Signups (Last 6 Months)</h3>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartUserGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}
                formatter={(value) => value.toLocaleString()}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ fill: '#2563eb', r: 4 }}
                activeDot={{ r: 6 }}
                name="New Users"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transactions (Last 7 Days)</h3>
            <Activity className="h-5 w-5 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartTransactions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}
                formatter={(value) => value.toLocaleString()}
              />
              <Legend />
              <Bar dataKey="transactions" fill="#10b981" name="Transactions" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue (Last 6 Months)</h3>
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(value) => `₦${value.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}
                formatter={(value) => `₦${value.toLocaleString()}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Transaction Status</h3>
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartTransactionStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, value }) => `${name}: ${(value / transactionsTotal * 100 || 0).toFixed(0)}%`}
              >
                {chartTransactionStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}
                formatter={(value) => value.toLocaleString()}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Pages</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {topPages.length > 0 ? (
              topPages.map((page, index) => {
                const percentage = Math.min(100, Math.round(((page.views || 0) / topPagesPeak) * 100));
                return (
                  <div key={`${page.path}-${index}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-gray-500">{index + 1}.</span>
                      <div>
                        <p className="font-medium text-gray-900">{page.path}</p>
                        <p className="text-sm text-gray-500">{(page.views || 0).toLocaleString()} views</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-500 py-8">No page analytics available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

