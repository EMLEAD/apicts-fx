'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, DollarSign, CheckCircle, Clock, XCircle, X, ExternalLink, Calendar, User as UserIcon, Image as ImageIcon } from 'lucide-react';

export default function ProductOrderManagement() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTransactionId, setUpdatingTransactionId] = useState(null);
  
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    totalAmount: 0
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
    calculateStats();
  }, [searchTerm, filterStatus, transactions]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await res.json();
      console.log('Fetched all transactions:', data.transactions);
      
      // Process transactions: parse metadata if it's a string
      const processedTransactions = (data.transactions || []).map(t => ({
        ...t,
        metadata: typeof t.metadata === 'string' ? JSON.parse(t.metadata) : t.metadata
      }));
      
      // Filter to only sell transactions (check both type and metadata)
      const sellTransactions = processedTransactions.filter(t => {
        const isTypeSell = t.type === 'sell';
        const hasSellMetadata = t.metadata && (t.metadata.sellStatus || t.metadata.transactionType === 'product_sell' || t.metadata.images);
        return isTypeSell || hasSellMetadata;
      });
      console.log('Filtered sell transactions:', sellTransactions);
      
      setTransactions(sellTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.metadata?.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const calculateStats = () => {
    const stats = {
      total: transactions.length,
      pending: transactions.filter(t => t.status === 'pending').length,
      completed: transactions.filter(t => t.status === 'completed').length,
      failed: transactions.filter(t => t.status === 'failed').length,
      totalAmount: transactions.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0)
    };
    setStats(stats);
  };

  const updateTransactionStatus = async (transactionId, status) => {
    try {
      setUpdatingTransactionId(transactionId);
      
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      const data = await res.json();
      
      if (res.ok && data.transaction) {
        // Find corresponding user inside transactions to keep relations
        const originalTx = transactions.find(t => t.id === transactionId);
        const updatedTxWithUser = {
          ...data.transaction,
          user: originalTx ? originalTx.user : null
        };
        
        // Update selected transaction state to reflect new status immediately
        if (selectedTransaction && selectedTransaction.id === transactionId) {
          setSelectedTransaction(updatedTxWithUser);
        }
      }
      
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
    } finally {
      setUpdatingTransactionId(null);
    }
  };

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Product Sell Orders</h1>
        <p className="text-gray-600 mt-2">Manage and fulfill product sell requests</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">₦{stats.totalAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search orders by ID, username or product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cards/Sort
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.user?.username || '—'}</div>
                    <div className="text-sm text-gray-500">{transaction.user?.email || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{transaction.metadata?.productName || '—'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ₦{parseFloat(transaction.amount).toLocaleString()} {transaction.currency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.metadata?.cardCount || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
          onClick={() => {
            const processedTx = {
              ...transaction,
              metadata: typeof transaction.metadata === 'string' ? JSON.parse(transaction.metadata) : transaction.metadata
            };
            setSelectedTransaction(processedTx);
          }}
          className="text-blue-600 hover:text-blue-900"
        >
          View Details
        </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No product sell orders found</p>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-gray-100 shadow-2xl overflow-hidden transform transition-all duration-300 animate-in fade-in-50 zoom-in-95 flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Product Sell Order Details</h3>
                <p className="text-xs font-mono text-gray-500">{selectedTransaction.id}</p>
              </div>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
              
              {/* User Block */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <UserIcon size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{selectedTransaction.user?.username || 'System Account'}</h4>
                  <p className="text-xs text-gray-500">{selectedTransaction.user?.email || 'N/A'}</p>
                </div>
              </div>

              {/* Status and core metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Amount to Pay</span>
                  <span className="text-lg font-extrabold text-green-600 mt-1 block">
                    ₦{parseFloat(selectedTransaction.amount).toLocaleString()} {selectedTransaction.currency}
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-xl text-center">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2.5 uppercase ${
                    selectedTransaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedTransaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>

              {/* Info Rows */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-medium">Product</span>
                  <span className="font-bold text-gray-900">{selectedTransaction.metadata?.productName || '—'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-medium">Quantity (USD)</span>
                  <span className="font-bold text-gray-900">${selectedTransaction.metadata?.quantity || '—'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-medium">Cards/Sort</span>
                  <span className="font-bold text-gray-900">{selectedTransaction.metadata?.cardCount || '—'}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-medium">Creation Date</span>
                  <span className="font-semibold text-gray-800 flex items-center space-x-1">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100 text-sm">
                  <span className="text-gray-500 font-medium">Exchange Rate</span>
                  <span className="font-semibold text-gray-800">
                    {selectedTransaction.exchangeRate ? `NGN ${selectedTransaction.exchangeRate}/USD` : '—'}
                  </span>
                </div>

                {selectedTransaction.description && (
                  <div className="py-2 border-b border-gray-100 text-sm">
                    <span className="text-gray-500 font-medium block mb-1">Description</span>
                    <span className="text-gray-700 italic bg-gray-50 rounded-lg p-2 block border border-gray-100/50 text-xs">
                      {selectedTransaction.description}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Images */}
              {selectedTransaction.metadata?.images && selectedTransaction.metadata.images.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={14} />
                    Product Images
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {selectedTransaction.metadata.images.map((image, index) => (
                      <a key={index} href={image} target="_blank" rel="noopener noreferrer" className="group">
                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-red-300 transition-all">
                          <img src={image} alt={`Product image ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Update Actions */}
              <div className="pt-4 border-t border-gray-100">
                <span className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 text-center">Fulfill / Update Status</span>
                <div className="flex space-x-3">
                  {selectedTransaction.status !== 'completed' && (
                    <button
                      onClick={() => updateTransactionStatus(selectedTransaction.id, 'completed')}
                      disabled={updatingTransactionId === selectedTransaction.id}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      {updatingTransactionId === selectedTransaction.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        'Complete & Pay User'
                      )}
                    </button>
                  )}
                  {selectedTransaction.status !== 'failed' && (
                    <button
                      onClick={() => updateTransactionStatus(selectedTransaction.id, 'failed')}
                      disabled={updatingTransactionId === selectedTransaction.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      {updatingTransactionId === selectedTransaction.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        'Mark Rejected'
                      )}
                    </button>
                  )}
                  {selectedTransaction.status !== 'pending' && (
                    <button
                      onClick={() => updateTransactionStatus(selectedTransaction.id, 'pending')}
                      disabled={updatingTransactionId === selectedTransaction.id}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      {updatingTransactionId === selectedTransaction.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Processing...
                        </>
                      ) : (
                        'Make Pending'
                      )}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
