'use client';

import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, Eye, ExternalLink, Loader2, Search, Filter } from 'lucide-react';

export default function DirectTransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ status: statusFilter, limit: '100' });
      const res = await fetch(`/api/admin/direct-transfers?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransfers(data.transactions || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch transfers:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);

  const handleAction = async (id, action, reason) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/direct-transfers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, rejectionReason: reason || undefined })
      });
      if (res.ok) {
        setSelected(null);
        setRejectReason('');
        fetchTransfers();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Action failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = transfers.filter(t => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.user?.username?.toLowerCase().includes(term) ||
      t.user?.email?.toLowerCase().includes(term) ||
      t.id.toLowerCase().includes(term)
    );
  });

  const meta = selected ? (typeof selected.metadata === 'string' ? JSON.parse(selected.metadata) : selected.metadata || {}) : null;

  return (
    <div className="pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Direct Bank Transfers</h1>
        <p className="text-gray-600 mt-2">Review and verify proof of payment submitted by users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 rounded-lg"><Clock className="h-6 w-6 text-yellow-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900">{transfers.filter(t => t.status === 'pending').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg"><CheckCircle className="h-6 w-6 text-green-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-gray-900">{transfers.filter(t => t.status === 'completed').length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-lg"><XCircle className="h-6 w-6 text-red-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Cancelled</p>
            <p className="text-2xl font-bold text-gray-900">{transfers.filter(t => t.status === 'cancelled').length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by ID, username, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="all">All</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No transfers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map(tx => {
                  const m = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : (tx.metadata || {});
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-sm">
                        <div className="font-medium text-gray-900">{tx.user?.username || '—'}</div>
                        <div className="text-gray-500 text-xs">{tx.user?.email || '—'}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                          {m.purpose?.replace(/_/g, ' ') || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        ₦{Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => {
                            const parsed = { ...tx, metadata: typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata };
                            setSelected(parsed);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                        >
                          <Eye size={14} /> View
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

      {/* Detail Modal */}
      {selected && meta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Transfer Details</h3>
                <p className="text-xs font-mono text-gray-500">{selected.id}</p>
              </div>
              <button onClick={() => { setSelected(null); setRejectReason(''); }} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100">
                <XCircle size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* User */}
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <span className="text-gray-500">User:</span>{' '}
                <span className="font-semibold text-gray-900">{selected.user?.username} ({selected.user?.email})</span>
              </div>

              {/* Amount & Purpose */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Amount</span>
                  <span className="text-lg font-extrabold text-gray-900">₦{Number(selected.amount).toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">Purpose</span>
                  <span className="text-sm font-bold text-gray-900 capitalize">{meta.purpose?.replace(/_/g, ' ')}</span>
                </div>
              </div>

              {/* Proof of Payment */}
              {meta.proofOfPayment && (
                <div>
                  <span className="block text-xs font-bold uppercase text-gray-500 mb-2">Proof of Payment</span>
                  <a href={meta.proofOfPayment} target="_blank" rel="noopener noreferrer" className="block">
                    <img src={meta.proofOfPayment} alt="Proof" className="w-full max-h-64 object-contain rounded-lg border border-gray-200 hover:border-red-300 transition-colors" />
                  </a>
                  <a href={meta.proofOfPayment} target="_blank" rel="noopener noreferrer" className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                    Open full image <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-2 text-sm">
                {meta.planName && <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="font-semibold text-gray-900">{meta.planName}</span></div>}
                {meta.productName && <div className="flex justify-between"><span className="text-gray-500">Product</span><span className="font-semibold text-gray-900">{meta.productName}</span></div>}
                {meta.quantity && <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-semibold text-gray-900">{meta.quantity} USD</span></div>}
                {meta.walletId && (
                  <div>
                    <span className="text-gray-500 text-xs">Wallet Address</span>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 font-mono text-xs text-gray-800 select-all break-all mt-1">{meta.walletId}</div>
                  </div>
                )}
                {meta.transactionWallet && (
                  <div>
                    <span className="text-gray-500 text-xs">Transaction Wallet</span>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 font-mono text-xs text-gray-800 select-all break-all mt-1">{meta.transactionWallet}</div>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  selected.status === 'completed' ? 'bg-green-100 text-green-700' :
                  selected.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {selected.status}
                </span>
                <span className="text-xs text-gray-500">{new Date(selected.createdAt).toLocaleString()}</span>
              </div>

              {/* Actions */}
              {selected.status === 'pending' && (
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(selected.id, 'approve')}
                      disabled={processingId === selected.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {processingId === selected.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      Approve & Credit
                    </button>
                    <button
                      onClick={() => handleAction(selected.id, 'reject', rejectReason)}
                      disabled={processingId === selected.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {processingId === selected.id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                      Reject
                    </button>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Rejection reason (optional)"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
