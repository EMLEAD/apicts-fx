'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const ADMIN_ROLES = ['super_admin', 'admin', 'manager', 'support'];

const formatCurrency = (amount, currency = 'NGN') => {
  const numericAmount = Number(amount) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(numericAmount);
};

const getAuthHeaders = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export default function AdminTransfersPage() {
  const router = useRouter();
  const [userRoleChecked, setUserRoleChecked] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransfers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      if (!headers) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/transactions', {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || 'Failed to load transactions');
      }

      const data = await response.json();
      const transfersOnly = (data.transactions || []).filter((transaction) => transaction.type === 'transfer');
      setTransfers(transfersOnly);
    } catch (err) {
      setError(err.message || 'Failed to load transfers');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (!ADMIN_ROLES.includes(parsed.role)) {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Failed to parse stored user', error);
        router.push('/login');
        return;
      }
    }

    setUserRoleChecked(true);
    fetchTransfers();
  }, [fetchTransfers, router]);

  const handleRefresh = async () => {
    if (refreshing) return;
    try {
      setRefreshing(true);
      await fetchTransfers();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTransfers = transfers.filter((transfer) => {
    if (filterStatus === 'all') return true;
    return transfer.status === filterStatus;
  });

  if (!userRoleChecked) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transfer Oversight</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor wallet-to-wallet transfers for compliance, disputes, and flagged activity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent transfers ({filteredTransfers.length})</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            Loading transfers...
          </div>
        ) : filteredTransfers.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 mx-6 my-8 px-4 py-12 text-center">
            <p className="text-sm font-medium text-gray-700">No transfers found</p>
            <p className="mt-1 text-xs text-gray-500">Transfers will appear here once users send funds to each other.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTransfers.map((transfer) => {
              const metadata = transfer.metadata || {};
              const direction = metadata.direction;
              const isCredit = direction === 'credit';
              const statusBadge = transfer.status === 'completed'
                ? { icon: CheckCircle, label: 'Completed', color: 'text-green-600', bg: 'bg-green-100' }
                : transfer.status === 'pending'
                ? { icon: Clock, label: 'Pending', color: 'text-yellow-600', bg: 'bg-yellow-100' }
                : { icon: AlertTriangle, label: transfer.status || 'Failed', color: 'text-red-600', bg: 'bg-red-100' };

              const CounterPartyLabel = () => {
                if (isCredit) {
                  return (
                    <span className="text-xs text-gray-500">Sender: {metadata.senderUsername || metadata.senderId || 'Unknown'}</span>
                  );
                }
                return (
                  <span className="text-xs text-gray-500">Recipient: {metadata.recipientUsername || metadata.recipientId || 'Unknown'}</span>
                );
              };

              return (
                <div key={transfer.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {isCredit ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 capitalize">{transfer.type}</p>
                      <CounterPartyLabel />
                      <p className="text-xs text-gray-400 mt-1">{new Date(transfer.createdAt).toLocaleString()}</p>
                      {metadata.fee ? (
                        <p className="text-xs text-gray-500">Fee: {formatCurrency(metadata.fee, transfer.currency)}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                      {isCredit ? '+' : '-'}{formatCurrency(transfer.amount, transfer.currency)}
                    </p>
                    <div className={`inline-flex items-center space-x-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge.bg} ${statusBadge.color}`}>
                      <statusBadge.icon className="h-3 w-3" />
                      <span>{statusBadge.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
