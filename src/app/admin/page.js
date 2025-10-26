'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  FileText,
  Video,
  Shield,
  TrendingDown
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    blogPosts: 0,
    vlogPosts: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const [usersRes, transactionsRes, blogRes, vlogRes] = await Promise.all([
        fetch('/api/admin/stats/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/stats/transactions', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/stats/blog', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/admin/stats/vlog', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const usersData = await usersRes.json();
      const transactionsData = await transactionsRes.json();
      const blogData = await blogRes.json();
      const vlogData = await vlogRes.json();

      setStats({
        totalUsers: usersData.totalUsers || 0,
        activeUsers: usersData.activeUsers || 0,
        totalTransactions: transactionsData.total || 0,
        pendingTransactions: transactionsData.pending || 0,
        totalRevenue: transactionsData.totalRevenue || 0,
        monthlyRevenue: transactionsData.monthlyRevenue || 0,
        blogPosts: blogData.total || 0,
        vlogPosts: vlogData.total || 0
      });

      if (usersData.recent) setRecentUsers(usersData.recent);
      if (transactionsData.recent) setRecentTransactions(transactionsData.recent);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here&apos;s what&apos;s happening with your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{stats.activeUsers} active</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-yellow-600">
            <Clock className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{stats.pendingTransactions} pending</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₦{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-green-600">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">₦{stats.monthlyRevenue.toLocaleString()} this month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Content</p>
              <p className="text-2xl font-bold text-gray-900">{stats.blogPosts + stats.vlogPosts}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-gray-600">
            <span className="text-sm font-medium">{stats.blogPosts} blog, {stats.vlogPosts} vlog</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 text-sm font-medium">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {user.isActive ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No recent users</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.status === 'completed' ? 'bg-green-100' :
                        transaction.status === 'pending' ? 'bg-yellow-100' :
                        'bg-red-100'
                      }`}>
                        {transaction.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : transaction.status === 'pending' ? (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                        <p className="text-sm text-gray-500">{transaction.currency}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₦{parseFloat(transaction.amount).toLocaleString()}</p>
                      <p className={`text-sm ${
                        transaction.status === 'completed' ? 'text-green-600' :
                        transaction.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No recent transactions</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

