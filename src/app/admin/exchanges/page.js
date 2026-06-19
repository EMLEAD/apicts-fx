'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  RefreshCw,
  X,
  User as UserIcon,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  RotateCcw,
  Loader2
} from 'lucide-react';
import {
  getTransactionDisplayStatus,
  getPaystackReference,
  parseTransactionMetadata,
  STATUS_TONE_CLASSES
} from '@/lib/utils/transactionStatus';

const EXCHANGE_ADMIN_ROLES = ['super_admin', 'admin'];

const STATUS_ICONS = {
  completed: CheckCircle,
  failed: AlertCircle,
  in_progress: TrendingUp,
  pending_payment: Clock,
  pending: Clock,
  refunded: RotateCcw
};

export default function AdminExchangesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        if (!EXCHANGE_ADMIN_ROLES.includes(parsed.role)) {
          router.push('/admin');
        }
      } catch {
        router.push('/admin-login');
      }
    } else {
      router.push('/admin-login');
    }
  }, [router]);

  const fetchExchanges = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      if (searchTerm) params.set('search', searchTerm);

      const res = await fetch(`/api/admin/exchanges?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to fetch exchanges');
      }

      const data = await res.json();
      setExchanges(data.exchanges || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && EXCHANGE_ADMIN_ROLES.includes(user.role)) {
      fetchExchanges();
    }
  }, [user, paymentFilter]);

  const filteredExchanges = useMemo(() => {
    if (fulfillmentFilter === 'all') return exchanges;
    return exchanges.filter((tx) => getTransactionDisplayStatus(tx).key === fulfillmentFilter);
  }, [exchanges, fulfillmentFilter]);

  const stats = useMemo(() => ({
    total: exchanges.length,
    awaitingPayment: exchanges.filter((t) => getTransactionDisplayStatus(t).key === 'pending_payment').length,
    inProgress: exchanges.filter((t) => getTransactionDisplayStatus(t).key === 'in_progress').length,
    completed: exchanges.filter((t) => getTransactionDisplayStatus(t).key === 'completed').length,
    failed: exchanges.filter((t) => ['failed', 'refunded'].includes(getTransactionDisplayStatus(t).key)).length,
    volume: exchanges.reduce((sum, t) => sum + Number(t.amount || 0), 0)
  }), [exchanges]);

  const openDetails = (exchange) => {
    const meta = parseTransactionMetadata(exchange.metadata);
    setSelectedExchange(exchange);
    setAdminNote(meta.adminNote || '');
  };

  const updateExchangeStatus = async (exchangeId, status) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/exchanges/${exchangeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminNote })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');

      if (selectedExchange?.id === exchangeId) {
        setSelectedExchange({ ...data.exchange, user: selectedExchange.user });
      }
      await fetchExchanges();
    } catch (err) {
      alert(err.message || 'Failed to update exchange');
    } finally {
      setUpdating(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchExchanges();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Exchange Orders</h1>
        <p className="text-gray-600 mt-2">
          Review product purchases, verify payments, and update fulfillment status.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900' },
          { label: 'Awaiting Payment', value: stats.awaitingPayment, color: 'text-yellow-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600' },
          { label: 'Completed', value: stats.completed, color: 'text-green-600' },
          { label: 'Failed / Refunded', value: stats.failed, color: 'text-red-600' },
          { label: 'Volume (NGN)', value: `₦${stats.volume.toLocaleString()}`, color: 'text-gray-900' }
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, product, wallet, reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Fulfillment Status</option>
            <option value="pending_payment">Awaiting Payment</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Search
          </button>
          <button
            type="button"
            onClick={() => { setRefreshing(true); fetchExchanges(); }}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-3" />
            <p className="text-gray-500">Loading exchanges...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-600">{error}</div>
        ) : filteredExchanges.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No exchange orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fulfillment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExchanges.map((tx) => {
                  const meta = parseTransactionMetadata(tx.metadata);
                  const display = getTransactionDisplayStatus(tx);
                  const StatusIcon = STATUS_ICONS[display.key] || Clock;

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{tx.user?.username || '—'}</div>
                        <div className="text-xs text-gray-500">{tx.user?.email || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{meta.productName || tx.targetCurrency}</div>
                        <div className="text-xs text-gray-500">{meta.quantity ? `$${meta.quantity} USD` : '—'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        ₦{Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold uppercase ${meta.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {meta.paymentStatus || 'unpaid'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_TONE_CLASSES[display.tone]}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {display.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => openDetails(tx)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedExchange && (() => {
        const meta = parseTransactionMetadata(selectedExchange.metadata);
        const display = getTransactionDisplayStatus(selectedExchange);
        const paystackRef = getPaystackReference(selectedExchange);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-100 shadow-2xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50 shrink-0">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Exchange Order</h3>
                  <p className="text-xs font-mono text-gray-500">{selectedExchange.id}</p>
                </div>
                <button type="button" onClick={() => setSelectedExchange(null)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
                  <UserIcon className="text-blue-600" size={20} />
                  <div>
                    <p className="font-bold text-gray-900">{selectedExchange.user?.username}</p>
                    <p className="text-xs text-gray-500">{selectedExchange.user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3 text-center border">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Product</p>
                    <p className="font-bold text-sm mt-1">{meta.productName || '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center border">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Quantity</p>
                    <p className="font-bold text-sm mt-1">{meta.quantity ? `$${meta.quantity}` : '—'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center border">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Paid</p>
                    <p className="font-bold text-sm mt-1">₦{Number(selectedExchange.amount).toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 text-center border">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Status</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_TONE_CLASSES[display.tone]}`}>
                      {display.label}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Payment Method</span>
                    <span className="font-semibold capitalize">{meta.paymentMethod || '—'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Payment Status</span>
                    <span className={`font-bold uppercase ${meta.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {meta.paymentStatus || 'unpaid'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Rate</span>
                    <span className="font-semibold">NGN {selectedExchange.exchangeRate}/USD</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">Created</span>
                    <span className="font-semibold flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(selectedExchange.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {paystackRef && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Paystack Ref</span>
                      <span className="font-mono text-xs">{paystackRef}</span>
                    </div>
                  )}
                </div>

                {meta.walletId && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs font-bold text-red-800 uppercase mb-2">Destination Wallet — send assets here</p>
                    <p className="font-mono text-sm break-all select-all bg-white border border-red-100 rounded-lg p-3">
                      {meta.walletId}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Admin follow-up note</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    placeholder="Internal note or follow-up details for this order..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-red-500 focus:border-red-500"
                  />
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs font-bold text-gray-400 uppercase text-center mb-3">Update Fulfillment Status</p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedExchange.status !== 'completed' && (
                      <button
                        type="button"
                        disabled={updating || meta.paymentStatus !== 'paid'}
                        onClick={() => updateExchangeStatus(selectedExchange.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-xs"
                      >
                        {updating ? 'Updating...' : 'Complete & Notify User'}
                      </button>
                    )}
                    {selectedExchange.status !== 'pending' && meta.paymentStatus === 'paid' && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => updateExchangeStatus(selectedExchange.id, 'pending')}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-xs"
                      >
                        Mark In Progress
                      </button>
                    )}
                    {selectedExchange.status !== 'failed' && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => updateExchangeStatus(selectedExchange.id, 'failed')}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-xs"
                      >
                        Mark Failed
                      </button>
                    )}
                    {selectedExchange.status !== 'cancelled' && (
                      <button
                        type="button"
                        disabled={updating}
                        onClick={() => updateExchangeStatus(selectedExchange.id, 'cancelled')}
                        className="bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-xs"
                      >
                        Refund / Cancel
                      </button>
                    )}
                  </div>
                  {meta.paymentStatus !== 'paid' && selectedExchange.status !== 'completed' && (
                    <p className="text-[11px] text-amber-600 mt-3 text-center">
                      Payment not confirmed yet — complete fulfillment only after payment is verified.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
